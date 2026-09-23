package org.amicats.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.repository.room.RoomRepository;
import org.amicats.backend.repository.user.UserAuthRepository;
import org.amicats.backend.repository.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Boots the whole Spring context on a real HTTP server to prove the /rooms endpoints (list, read,
 * create, update and status change) are actually reachable only by an Administrator and behave as
 * the frontend expects — unit tests of the use cases alone don't exercise SecurityConfig, JSON
 * serialization, routing, validation or the JPQL search query.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"app.rate-limit.sensitive.capacity=1000", "app.rate-limit.default.capacity=1000"})
class RoomManagementFlowIntegrationTest {

  private static final String PASSWORD = "SenhaForte123!";

  @LocalServerPort private int port;

  @Autowired private UserRepository userRepository;
  @Autowired private UserAuthRepository userAuthRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private RoomRepository roomRepository;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient httpClient = HttpClient.newHttpClient();

  private Integer adminUserId;
  private Integer adminAuthId;
  private Integer assistantUserId;
  private Integer assistantAuthId;
  private Integer vetUserId;
  private Integer vetAuthId;
  private Integer targetRoomId;

  private String adminEmail;
  private String assistantEmail;
  private String vetEmail;
  private String targetTitleToken;

  @BeforeEach
  void setUp() {
    adminEmail = "admin-" + UUID.randomUUID() + "@amicats.org.br";
    assistantEmail = "assistant-" + UUID.randomUUID() + "@amicats.org.br";
    vetEmail = "vet-" + UUID.randomUUID() + "@amicats.org.br";
    targetTitleToken = "Sala" + UUID.randomUUID().toString().replace("-", "");

    adminUserId = seedReadyUser("Admin de Teste", AccessType.Administrator).getId();
    adminAuthId = seedAuth(adminUserId, adminEmail);

    assistantUserId = seedReadyUser("Assistente de Teste", AccessType.Assistant).getId();
    assistantAuthId = seedAuth(assistantUserId, assistantEmail);

    vetUserId = seedReadyUser("Veterinário de Teste", AccessType.Veterinarian).getId();
    vetAuthId = seedAuth(vetUserId, vetEmail);

    targetRoomId =
        roomRepository.save(new Room(targetTitleToken, "Descrição de teste", null, 4)).getId();
  }

  private User seedReadyUser(String fullName, AccessType accessType) {
    return userRepository.save(
        new User(fullName, null, null, accessType, null, null, LocalDateTime.now()));
  }

  private Integer seedAuth(Integer userId, String email) {
    UserAuth auth =
        new UserAuth(
            userRepository.findById(userId).orElseThrow(), email, passwordEncoder.encode(PASSWORD));
    return userAuthRepository.save(auth).getId();
  }

  @AfterEach
  void tearDown() {
    roomRepository.deleteById(targetRoomId);
    userAuthRepository.deleteById(vetAuthId);
    userRepository.deleteById(vetUserId);
    userAuthRepository.deleteById(assistantAuthId);
    userRepository.deleteById(assistantUserId);
    userAuthRepository.deleteById(adminAuthId);
    userRepository.deleteById(adminUserId);
  }

  @Test
  void anAdministratorCanListAndDeactivateARoom() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> listResponse = get("/rooms?search=" + targetTitleToken, adminToken);
    assertThat(listResponse.statusCode()).isEqualTo(200);
    List<Map<String, Object>> rooms = contentOf(parse(listResponse));
    assertThat(rooms)
        .anySatisfy(
            room -> {
              assertThat(room.get("id")).isEqualTo(targetRoomId);
              assertThat(room.get("active")).isEqualTo(true);
            });

    HttpResponse<String> deactivateResponse = changeStatus(targetRoomId, false, adminToken);
    assertThat(deactivateResponse.statusCode()).isEqualTo(204);

    Map<String, Object> afterRoom = parse(get("/rooms/" + targetRoomId, adminToken));
    assertThat(afterRoom.get("active")).isEqualTo(false);
  }

  @Test
  void anAdministratorCanReactivateADeactivatedRoom() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    String path = "/rooms/" + targetRoomId;

    assertThat(changeStatus(targetRoomId, false, adminToken).statusCode()).isEqualTo(204);
    assertThat(parse(get(path, adminToken)).get("active")).isEqualTo(false);

    assertThat(changeStatus(targetRoomId, true, adminToken).statusCode()).isEqualTo(204);
    assertThat(parse(get(path, adminToken)).get("active")).isEqualTo(true);
  }

  @Test
  void anAdministratorCanCreateARoom() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    String title = "Nova Sala " + UUID.randomUUID();

    HttpResponse<String> response =
        send("POST", "/rooms", adminToken, roomBody(title, "Descrição", null, 8));

    assertThat(response.statusCode()).isEqualTo(201);
    Map<String, Object> created = parse(response);
    Integer createdId = ((Number) created.get("id")).intValue();
    try {
      assertThat(created.get("title")).isEqualTo(title);
      assertThat(created.get("maxCapacity")).isEqualTo(8);
      assertThat(created.get("active")).isEqualTo(true);
    } finally {
      roomRepository.deleteById(createdId);
    }
  }

  @Test
  void creatingARoomWithoutATitleReturnsBadRequest() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response =
        send("POST", "/rooms", adminToken, roomBody(null, null, null, null));

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void anAdministratorCanUpdateARoom() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response =
        send(
            "PUT",
            "/rooms/" + targetRoomId,
            adminToken,
            roomBody(targetTitleToken + " Editada", "Nova descrição", null, 10));

    assertThat(response.statusCode()).isEqualTo(200);
    Map<String, Object> updated = parse(response);
    assertThat(updated.get("title")).isEqualTo(targetTitleToken + " Editada");
    assertThat(updated.get("maxCapacity")).isEqualTo(10);
  }

  @Test
  void updatingAnUnknownRoomReturnsNotFound() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response =
        send("PUT", "/rooms/999999999", adminToken, roomBody("Sala", null, null, null));

    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  void deactivatingAnUnknownRoomReturnsNotFound() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response = changeStatus(999999999, false, adminToken);

    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  void changingStatusWithoutTheActiveFieldReturnsBadRequest() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response =
        send("PATCH", "/rooms/" + targetRoomId + "/status", adminToken, Map.of());

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void aNonAdministratorCannotListRooms() throws Exception {
    String assistantToken = loginAndGetToken(assistantEmail);

    HttpResponse<String> response = get("/rooms", assistantToken);

    assertThat(response.statusCode()).isEqualTo(403);
  }

  // Widened for the "Novo gato" flow (UC-06): a Médico-Veterinário also cadastra o gato and
  // needs to pick its room, so read access can't stay Administrator-only.
  @Test
  void aVeterinarianCanListAndReadRooms() throws Exception {
    String vetToken = loginAndGetToken(vetEmail);

    HttpResponse<String> listResponse = get("/rooms?search=" + targetTitleToken, vetToken);
    assertThat(listResponse.statusCode()).isEqualTo(200);
    assertThat(contentOf(parse(listResponse)))
        .anySatisfy(room -> assertThat(room.get("id")).isEqualTo(targetRoomId));

    assertThat(get("/rooms/" + targetRoomId, vetToken).statusCode()).isEqualTo(200);
  }

  @Test
  void aNonAdministratorCannotCreateRooms() throws Exception {
    String assistantToken = loginAndGetToken(assistantEmail);

    HttpResponse<String> response =
        send("POST", "/rooms", assistantToken, roomBody("Sala Proibida", null, null, null));

    assertThat(response.statusCode()).isEqualTo(403);
  }

  @Test
  void aNonAdministratorCannotChangeRoomStatus() throws Exception {
    String assistantToken = loginAndGetToken(assistantEmail);

    HttpResponse<String> response = changeStatus(targetRoomId, false, assistantToken);

    assertThat(response.statusCode()).isEqualTo(403);
  }

  @Test
  void filtersByActiveStatus() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    assertThat(changeStatus(targetRoomId, false, adminToken).statusCode()).isEqualTo(204);

    List<Map<String, Object>> inactiveOnly =
        contentOf(parse(get("/rooms?search=" + targetTitleToken + "&active=false", adminToken)));
    assertThat(inactiveOnly).extracting(room -> room.get("id")).containsExactly(targetRoomId);

    List<Map<String, Object>> activeOnly =
        contentOf(parse(get("/rooms?search=" + targetTitleToken + "&active=true", adminToken)));
    assertThat(activeOnly).isEmpty();
  }

  @Test
  void paginatesResultsAcrossPages() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    String pageToken = "Pag" + UUID.randomUUID().toString().replace("-", "");

    Room first = roomRepository.save(new Room(pageToken + "A", null, null, null));
    Room second = roomRepository.save(new Room(pageToken + "B", null, null, null));

    try {
      Map<String, Object> firstPage =
          parse(get("/rooms?search=" + pageToken + "&page=0&size=1", adminToken));
      assertThat(contentOf(firstPage)).hasSize(1);
      assertThat(firstPage.get("totalElements")).isEqualTo(2);
      assertThat(firstPage.get("totalPages")).isEqualTo(2);

      Map<String, Object> secondPage =
          parse(get("/rooms?search=" + pageToken + "&page=1&size=1", adminToken));
      assertThat(contentOf(secondPage)).hasSize(1);

      Object firstPageRoomId = contentOf(firstPage).get(0).get("id");
      Object secondPageRoomId = contentOf(secondPage).get(0).get("id");
      assertThat(List.of(firstPageRoomId, secondPageRoomId))
          .containsExactlyInAnyOrder(first.getId(), second.getId());
    } finally {
      roomRepository.deleteById(first.getId());
      roomRepository.deleteById(second.getId());
    }
  }

  private Map<String, Object> roomBody(
      String title, String description, String coverImageUrl, Integer maxCapacity) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("title", title);
    body.put("description", description);
    body.put("coverImageUrl", coverImageUrl);
    body.put("maxCapacity", maxCapacity);
    return body;
  }

  private HttpResponse<String> login(String email) throws Exception {
    return send("POST", "/auth/login", null, Map.of("email", email, "password", PASSWORD));
  }

  private String loginAndGetToken(String email) throws Exception {
    return (String) parse(login(email)).get("token");
  }

  private String baseUrl() {
    return "http://localhost:" + port;
  }

  private HttpResponse<String> get(String path, String token) throws Exception {
    return send("GET", path, token, null);
  }

  private HttpResponse<String> changeStatus(Integer roomId, boolean active, String token)
      throws Exception {
    return send("PATCH", "/rooms/" + roomId + "/status", token, Map.of("active", active));
  }

  private HttpResponse<String> send(String method, String path, String token, Object body)
      throws Exception {
    HttpRequest.Builder builder = HttpRequest.newBuilder().uri(URI.create(baseUrl() + path));
    if (token != null) {
      builder.header("Authorization", "Bearer " + token);
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
  private List<Map<String, Object>> contentOf(Map<String, Object> page) {
    return (List<Map<String, Object>>) page.get("content");
  }
}
