package org.amicats.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.repository.room.RoomRepository;
import org.amicats.backend.repository.stock.StockItemRepository;
import org.amicats.backend.repository.sync.SyncDeviceRepository;
import org.amicats.backend.repository.user.UserAuthRepository;
import org.amicats.backend.repository.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"app.rate-limit.sensitive.capacity=1000", "app.rate-limit.default.capacity=1000"})
class OfflineSyncFlowIntegrationTest {

  private static final String PASSWORD = "SenhaForte123!";

  @LocalServerPort private int port;

  @Autowired private UserRepository userRepository;
  @Autowired private UserAuthRepository userAuthRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private RoomRepository roomRepository;
  @Autowired private StockItemRepository stockItemRepository;
  @Autowired private SyncDeviceRepository syncDeviceRepository;
  @Autowired private JdbcTemplate jdbcTemplate;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient httpClient = HttpClient.newHttpClient();

  private final List<Integer> createdRoomIds = new ArrayList<>();
  private final List<String> createdDeviceIds = new ArrayList<>();
  private Integer stockItemId;

  private Integer adminUserId;
  private Integer adminAuthId;
  private Integer assistantUserId;
  private Integer assistantAuthId;
  private Integer viewerUserId;
  private Integer viewerAuthId;

  private String adminEmail;
  private String assistantEmail;
  private String viewerEmail;

  @BeforeEach
  void setUp() {
    adminEmail = "admin-" + UUID.randomUUID() + "@amicats.org.br";
    assistantEmail = "assistant-" + UUID.randomUUID() + "@amicats.org.br";
    viewerEmail = "viewer-" + UUID.randomUUID() + "@amicats.org.br";

    adminUserId = seedUser("Admin de Teste", AccessType.Administrator);
    adminAuthId = seedAuth(adminUserId, adminEmail);
    assistantUserId = seedUser("Assistente de Teste", AccessType.Assistant);
    assistantAuthId = seedAuth(assistantUserId, assistantEmail);
    viewerUserId = seedUser("Visualizador de Teste", AccessType.Viewer);
    viewerAuthId = seedAuth(viewerUserId, viewerEmail);

    stockItemId =
        stockItemRepository
            .save(
                new StockItem(
                    "Item sync " + UUID.randomUUID(), "Medicamento", BigDecimal.TEN, "ml", null))
            .getId();
  }

  @AfterEach
  void tearDown() {
    createdDeviceIds.forEach(syncDeviceRepository::deleteById);
    jdbcTemplate.update(
        "delete from idempotency_keys where id_user in (?, ?, ?)",
        adminUserId,
        assistantUserId,
        viewerUserId);
    createdRoomIds.forEach(roomRepository::deleteById);
    stockItemRepository.deleteById(stockItemId);
    userAuthRepository.deleteById(viewerAuthId);
    userRepository.deleteById(viewerUserId);
    userAuthRepository.deleteById(assistantAuthId);
    userRepository.deleteById(assistantUserId);
    userAuthRepository.deleteById(adminAuthId);
    userRepository.deleteById(adminUserId);
  }

  @Test
  void repeatingARequestWithTheSameKeyDoesNotCreateASecondRecord() throws Exception {
    String token = loginAndGetToken(adminEmail);
    String key = UUID.randomUUID().toString();
    String title = "Sala idempotente " + UUID.randomUUID();

    HttpResponse<String> first = post("/rooms", token, key, roomBody(title));
    HttpResponse<String> second = post("/rooms", token, key, roomBody(title));

    assertThat(first.statusCode()).isEqualTo(201);
    Integer createdId = ((Number) parse(first).get("id")).intValue();
    createdRoomIds.add(createdId);

    assertThat(second.statusCode()).isEqualTo(201);
    assertThat(second.headers().firstValue("Idempotent-Replayed")).hasValue("true");
    assertThat(((Number) parse(second).get("id")).intValue()).isEqualTo(createdId);
    assertThat(first.headers().firstValue("Idempotent-Replayed")).isEmpty();

    assertThat(countRoomsWithTitle(title)).isEqualTo(1);
  }

  @Test
  void requestsWithoutAKeyAreNotDeduplicated() throws Exception {
    String token = loginAndGetToken(adminEmail);
    String title = "Sala sem chave " + UUID.randomUUID();

    HttpResponse<String> first = post("/rooms", token, null, roomBody(title));
    HttpResponse<String> second = post("/rooms", token, null, roomBody(title));

    createdRoomIds.add(((Number) parse(first).get("id")).intValue());
    createdRoomIds.add(((Number) parse(second).get("id")).intValue());

    assertThat(countRoomsWithTitle(title)).isEqualTo(2);
  }

  @Test
  void reusingAKeyOnAnotherRequestIsRejected() throws Exception {
    String token = loginAndGetToken(adminEmail);
    String key = UUID.randomUUID().toString();

    HttpResponse<String> first =
        post("/rooms", token, key, roomBody("Sala chave " + UUID.randomUUID()));
    createdRoomIds.add(((Number) parse(first).get("id")).intValue());

    HttpResponse<String> reused =
        post("/stock/entries", token, key, Map.of("stockItemId", stockItemId));

    assertThat(reused.statusCode()).isEqualTo(422);
  }

  @Test
  void aMalformedKeyIsRejected() throws Exception {
    String token = loginAndGetToken(adminEmail);

    HttpResponse<String> response =
        post("/rooms", token, "curta", roomBody("Sala " + UUID.randomUUID()));

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void aFailedRequestReleasesTheKeySoTheClientCanRetry() throws Exception {
    String token = loginAndGetToken(adminEmail);
    String key = UUID.randomUUID().toString();
    String title = "Sala retry " + UUID.randomUUID();

    HttpResponse<String> invalid = post("/rooms", token, key, Map.of("description", "sem título"));
    assertThat(invalid.statusCode()).isEqualTo(400);

    HttpResponse<String> retry = post("/rooms", token, key, roomBody(title));
    assertThat(retry.statusCode()).isEqualTo(201);
    assertThat(retry.headers().firstValue("Idempotent-Replayed")).isEmpty();
    createdRoomIds.add(((Number) parse(retry).get("id")).intValue());
  }

  @Test
  void keysAreScopedPerUser() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    String key = UUID.randomUUID().toString();

    HttpResponse<String> adminResponse =
        post("/rooms", adminToken, key, roomBody("Sala admin " + UUID.randomUUID()));
    createdRoomIds.add(((Number) parse(adminResponse).get("id")).intValue());

    String viewerToken = loginAndGetToken(viewerEmail);
    HttpResponse<String> viewerResponse =
        post("/rooms", viewerToken, key, roomBody("Sala viewer " + UUID.randomUUID()));

    assertThat(viewerResponse.statusCode()).isEqualTo(403);
    assertThat(viewerResponse.headers().firstValue("Idempotent-Replayed")).isEmpty();
  }

  @Test
  void pullReturnsRecentlyChangedRecordsAndAdvancesTheCursor() throws Exception {
    String token = loginAndGetToken(assistantEmail);
    String title = "Sala pull " + UUID.randomUUID();
    Integer roomId = roomRepository.save(new Room(title, null, null, 3)).getId();
    createdRoomIds.add(roomId);

    Map<String, Object> full = parse(get("/sync/pull", token));

    assertThat(ids(full, "rooms")).contains(roomId);
    assertThat(ids(full, "stockItems")).contains(stockItemId);
    String cursor = (String) full.get("cursor");
    assertThat(cursor).isNotNull();

    Map<String, Object> afterCursor = parse(get("/sync/pull?since=" + cursor, token));
    assertThat(ids(afterCursor, "rooms")).contains(roomId);

    LocalDateTime future =
        LocalDateTime.now(ZoneOffset.UTC).plusDays(1).truncatedTo(ChronoUnit.SECONDS);
    Map<String, Object> empty = parse(get("/sync/pull?since=" + future, token));
    assertThat(ids(empty, "rooms")).isEmpty();
    assertThat(ids(empty, "stockItems")).isEmpty();
    assertThat(empty.get("cursor")).isEqualTo(future.toString());
  }

  @Test
  void pullSeesUpdatesMadeAfterTheCursor() throws Exception {
    String token = loginAndGetToken(assistantEmail);
    LocalDateTime before = LocalDateTime.now(ZoneOffset.UTC).minusMinutes(10);

    Room room = roomRepository.save(new Room("Sala upd " + UUID.randomUUID(), null, null, 3));
    createdRoomIds.add(room.getId());
    Thread.sleep(50);
    room.updateDetails("Sala renomeada", null, 5);
    roomRepository.saveAndFlush(room);

    Map<String, Object> changes = parse(get("/sync/pull?since=" + before, token));

    List<Map<String, Object>> rooms = list(changes, "rooms");
    assertThat(rooms)
        .anySatisfy(
            item -> {
              assertThat(item.get("id")).isEqualTo(room.getId());
              assertThat(item.get("title")).isEqualTo("Sala renomeada");
              assertThat(item.get("maxCapacity")).isEqualTo(5);
            });
  }

  @Test
  void pullDoesNotExposeStockToAViewer() throws Exception {
    String token = loginAndGetToken(viewerEmail);

    Map<String, Object> changes = parse(get("/sync/pull", token));

    assertThat(list(changes, "stockItems")).isEmpty();
  }

  @Test
  void pullRequiresAuthentication() throws Exception {
    assertThat(send("GET", "/sync/pull", null, null, null).statusCode()).isEqualTo(401);
  }

  @Test
  void aDeviceReportsItsQueueAndTheAdministratorCanSeeIt() throws Exception {
    String deviceId = "device-" + UUID.randomUUID();
    createdDeviceIds.add(deviceId);
    String assistantToken = loginAndGetToken(assistantEmail);

    HttpResponse<String> heartbeat =
        post(
            "/sync/heartbeat",
            assistantToken,
            null,
            Map.of(
                "deviceId",
                deviceId,
                "deviceName",
                "Galaxy",
                "platform",
                "android",
                "appVersion",
                "1.0.0",
                "pendingCount",
                3,
                "rejectedCount",
                0));
    assertThat(heartbeat.statusCode()).isEqualTo(204);

    HttpResponse<String> forbidden = get("/sync/devices", assistantToken);
    assertThat(forbidden.statusCode()).isEqualTo(403);

    String adminToken = loginAndGetToken(adminEmail);
    List<Map<String, Object>> devices = parseList(get("/sync/devices", adminToken));

    assertThat(devices)
        .anySatisfy(
            device -> {
              assertThat(device.get("deviceId")).isEqualTo(deviceId);
              assertThat(device.get("pendingCount")).isEqualTo(3);
              assertThat(device.get("status")).isEqualTo("Pending");
              assertThat(device.get("userName")).isEqualTo("Assistente de Teste");
            });

    post(
        "/sync/heartbeat",
        assistantToken,
        null,
        Map.of("deviceId", deviceId, "pendingCount", 0, "rejectedCount", 0));

    assertThat(parseList(get("/sync/devices", adminToken)))
        .anySatisfy(
            device -> {
              assertThat(device.get("deviceId")).isEqualTo(deviceId);
              assertThat(device.get("status")).isEqualTo("Synchronized");
            });
  }

  @Test
  void aHeartbeatWithoutDeviceIdIsRejected() throws Exception {
    String token = loginAndGetToken(assistantEmail);

    HttpResponse<String> response =
        post("/sync/heartbeat", token, null, Map.of("pendingCount", 1, "rejectedCount", 0));

    assertThat(response.statusCode()).isEqualTo(400);
  }

  private int countRoomsWithTitle(String title) {
    return (int) roomRepository.findAll().stream().filter(r -> title.equals(r.getTitle())).count();
  }

  private Integer seedUser(String fullName, AccessType accessType) {
    return userRepository
        .save(
            new User(
                fullName, null, null, accessType, null, null, LocalDateTime.now(ZoneOffset.UTC)))
        .getId();
  }

  private Integer seedAuth(Integer userId, String email) {
    UserAuth auth =
        new UserAuth(
            userRepository.findById(userId).orElseThrow(), email, passwordEncoder.encode(PASSWORD));
    return userAuthRepository.save(auth).getId();
  }

  private Map<String, Object> roomBody(String title) {
    return Map.of("title", title, "description", "Descrição", "maxCapacity", 4);
  }

  private String loginAndGetToken(String email) throws Exception {
    return (String)
        parse(send("POST", "/auth/login", null, null, Map.of("email", email, "password", PASSWORD)))
            .get("token");
  }

  private HttpResponse<String> get(String path, String token) throws Exception {
    return send("GET", path, token, null, null);
  }

  private HttpResponse<String> post(String path, String token, String key, Object body)
      throws Exception {
    return send("POST", path, token, key, body);
  }

  private HttpResponse<String> send(
      String method, String path, String token, String idempotencyKey, Object body)
      throws Exception {
    HttpRequest.Builder builder =
        HttpRequest.newBuilder().uri(URI.create("http://localhost:" + port + path));
    if (token != null) {
      builder.header("Authorization", "Bearer " + token);
    }
    if (idempotencyKey != null) {
      builder.header("Idempotency-Key", idempotencyKey);
    }
    if (body == null) {
      builder.method(method, BodyPublishers.noBody());
    } else {
      builder
          .header("Content-Type", "application/json")
          .method(method, BodyPublishers.ofString(objectMapper.writeValueAsString(body)));
    }
    return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> parse(HttpResponse<String> response) throws Exception {
    return objectMapper.readValue(response.body(), Map.class);
  }

  @SuppressWarnings("unchecked")
  private List<Map<String, Object>> parseList(HttpResponse<String> response) throws Exception {
    return objectMapper.readValue(response.body(), List.class);
  }

  @SuppressWarnings("unchecked")
  private List<Map<String, Object>> list(Map<String, Object> changes, String name) {
    return (List<Map<String, Object>>) changes.get(name);
  }

  private List<Integer> ids(Map<String, Object> changes, String name) {
    return list(changes, name).stream().map(item -> ((Number) item.get("id")).intValue()).toList();
  }
}
