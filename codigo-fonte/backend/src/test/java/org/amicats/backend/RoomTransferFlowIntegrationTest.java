package org.amicats.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.enums.Sex;
import org.amicats.backend.repository.cat.CatRepository;
import org.amicats.backend.repository.room.RoomRepository;
import org.amicats.backend.repository.roomtransfer.RoomTransferRepository;
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
 * Boots the whole Spring context on a real HTTP server to prove the /cats/{id}/room-transfers
 * endpoints are reachable as the frontend expects, enforce the Administrator/Veterinarian role
 * restriction on create, and that the repository's findByCat_IdOrderByCreatedAtDesc query (not
 * exercised by the pure-Mockito use case tests) actually returns the most recent transfer first.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"app.rate-limit.sensitive.capacity=1000", "app.rate-limit.default.capacity=1000"})
class RoomTransferFlowIntegrationTest {

  private static final String PASSWORD = "SenhaForte123!";

  @LocalServerPort private int port;

  @Autowired private UserRepository userRepository;
  @Autowired private UserAuthRepository userAuthRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private RoomRepository roomRepository;
  @Autowired private CatRepository catRepository;
  @Autowired private RoomTransferRepository roomTransferRepository;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient httpClient = HttpClient.newHttpClient();

  private User adminUser;
  private Integer adminAuthId;
  private Integer assistantUserId;
  private Integer assistantAuthId;
  private Integer vetUserId;
  private Integer vetAuthId;
  private Integer fromRoomId;
  private Integer toRoomId;
  private Integer fullRoomId;
  private Integer catId;

  private String adminEmail;
  private String assistantEmail;
  private String vetEmail;

  @BeforeEach
  void setUp() {
    adminEmail = "admin-" + UUID.randomUUID() + "@amicats.org.br";
    assistantEmail = "assistant-" + UUID.randomUUID() + "@amicats.org.br";
    vetEmail = "vet-" + UUID.randomUUID() + "@amicats.org.br";

    adminUser = seedReadyUser("Admin de Teste", AccessType.Administrator);
    adminAuthId = seedAuth(adminUser.getId(), adminEmail);

    User assistant = seedReadyUser("Assistente de Teste", AccessType.Assistant);
    assistantUserId = assistant.getId();
    assistantAuthId = seedAuth(assistantUserId, assistantEmail);

    User vet = seedReadyUser("Veterinário de Teste", AccessType.Veterinarian);
    vetUserId = vet.getId();
    vetAuthId = seedAuth(vetUserId, vetEmail);

    String token = UUID.randomUUID().toString().replace("-", "");
    fromRoomId = roomRepository.save(new Room("Origem" + token, null, null, 4)).getId();
    toRoomId = roomRepository.save(new Room("Destino" + token, null, null, 4)).getId();
    fullRoomId = roomRepository.save(new Room("Lotada" + token, null, null, 1)).getId();

    catId = seedCat("Gato" + token, roomRepository.findById(fromRoomId).orElseThrow()).getId();
    // Fills the "lotada" room to capacity (1) with a second cat, so transferring the target cat
    // there is rejected for being full, not for some other reason.
    seedCat("Enchendo" + token, roomRepository.findById(fullRoomId).orElseThrow());
  }

  private User seedReadyUser(String fullName, AccessType accessType) {
    return userRepository.save(
        new User(fullName, null, null, accessType, null, null, LocalDateTime.now(ZoneOffset.UTC)));
  }

  private Integer seedAuth(Integer userId, String email) {
    UserAuth auth =
        new UserAuth(
            userRepository.findById(userId).orElseThrow(), email, passwordEncoder.encode(PASSWORD));
    return userAuthRepository.save(auth).getId();
  }

  private Cat seedCat(String name, Room room) {
    return catRepository.save(
        new Cat(
            name,
            room,
            Sex.Female,
            LocalDate.now().minusYears(2),
            "Rajada",
            new BigDecimal("3.50"),
            null,
            GeneralStatus.UnderTreatment,
            null,
            null,
            null,
            null,
            null,
            null,
            adminUser));
  }

  @AfterEach
  void tearDown() {
    roomTransferRepository
        .findByCat_IdOrderByCreatedAtDesc(catId)
        .forEach(roomTransferRepository::delete);
    catRepository.findAll().stream()
        .filter(cat -> cat.getRoom() != null)
        .filter(
            cat ->
                cat.getRoom().getId().equals(fromRoomId)
                    || cat.getRoom().getId().equals(toRoomId)
                    || cat.getRoom().getId().equals(fullRoomId))
        .forEach(cat -> catRepository.deleteById(cat.getId()));
    roomRepository.deleteById(fromRoomId);
    roomRepository.deleteById(toRoomId);
    roomRepository.deleteById(fullRoomId);
    userAuthRepository.deleteById(vetAuthId);
    userRepository.deleteById(vetUserId);
    userAuthRepository.deleteById(assistantAuthId);
    userRepository.deleteById(assistantUserId);
    userAuthRepository.deleteById(adminAuthId);
    userRepository.deleteById(adminUser.getId());
  }

  @Test
  void anAdministratorCanTransferACatAndTheHistoryShowsTheMostRecentFirst() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> first = transfer(catId, toRoomId, "Alta clínica.", adminToken);
    assertThat(first.statusCode()).isEqualTo(201);
    assertThat(parse(first).get("roomId")).isEqualTo(toRoomId);

    HttpResponse<String> second =
        transfer(catId, fromRoomId, "Retorno para observação.", adminToken);
    assertThat(second.statusCode()).isEqualTo(201);
    assertThat(parse(second).get("roomId")).isEqualTo(fromRoomId);

    HttpResponse<String> listResponse = get("/cats/" + catId + "/room-transfers", adminToken);
    assertThat(listResponse.statusCode()).isEqualTo(200);
    List<Map<String, Object>> transfers = parseList(listResponse);
    assertThat(transfers).hasSize(2);
    assertThat(transfers.get(0).get("reason")).isEqualTo("Retorno para observação.");
    assertThat(transfers.get(0).get("fromRoomId")).isEqualTo(toRoomId);
    assertThat(transfers.get(0).get("toRoomId")).isEqualTo(fromRoomId);
    assertThat(transfers.get(1).get("reason")).isEqualTo("Alta clínica.");
  }

  @Test
  void aVeterinarianCanAlsoTransferACat() throws Exception {
    String vetToken = loginAndGetToken(vetEmail);

    HttpResponse<String> response = transfer(catId, toRoomId, "Reavaliação clínica.", vetToken);

    assertThat(response.statusCode()).isEqualTo(201);
  }

  @Test
  void anAssistantCannotTransferACat() throws Exception {
    String assistantToken = loginAndGetToken(assistantEmail);

    HttpResponse<String> response = transfer(catId, toRoomId, "Tentativa negada.", assistantToken);

    assertThat(response.statusCode()).isEqualTo(403);
  }

  @Test
  void anAssistantCanStillReadTheTransferHistory() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    assertThat(transfer(catId, toRoomId, "Alta clínica.", adminToken).statusCode()).isEqualTo(201);

    String assistantToken = loginAndGetToken(assistantEmail);
    HttpResponse<String> response = get("/cats/" + catId + "/room-transfers", assistantToken);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(parseList(response)).hasSize(1);
  }

  @Test
  void transferringToTheSameRoomIsRejectedWithAClearMessage() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response = transfer(catId, fromRoomId, "Motivo irrelevante.", adminToken);

    assertThat(response.statusCode()).isEqualTo(400);
    assertThat(parse(response).get("message")).isEqualTo("O gato já está nessa sala.");
  }

  @Test
  void transferringToAFullRoomIsRejected() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response = transfer(catId, fullRoomId, "Não deveria caber.", adminToken);

    assertThat(response.statusCode()).isEqualTo(400);
    assertThat((String) parse(response).get("message")).contains("lotada");
  }

  private HttpResponse<String> transfer(Integer catId, Integer roomId, String reason, String token)
      throws Exception {
    return send(
        "POST",
        "/cats/" + catId + "/room-transfers",
        token,
        Map.of("roomId", roomId, "reason", reason));
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
  private List<Map<String, Object>> parseList(HttpResponse<String> response) throws Exception {
    return objectMapper.readValue(response.body(), List.class);
  }
}
