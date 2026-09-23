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
import java.util.Map;
import java.util.UUID;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.repository.cat.CatPhotoRepository;
import org.amicats.backend.repository.cat.CatRepository;
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
 * Boots the whole Spring context on a real HTTP server to prove /cats is reachable only by an
 * Administrator or Médico-Veterinário (UC-06), resolves the room it's placed in, and defaults the
 * clinical status when the caller leaves it out — unit tests of the use case alone don't exercise
 * SecurityConfig, JSON serialization, routing or bean validation.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"app.rate-limit.sensitive.capacity=1000", "app.rate-limit.default.capacity=1000"})
class CatManagementFlowIntegrationTest {

  private static final String PASSWORD = "SenhaForte123!";

  @LocalServerPort private int port;

  @Autowired private UserRepository userRepository;
  @Autowired private UserAuthRepository userAuthRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private RoomRepository roomRepository;
  @Autowired private CatRepository catRepository;
  @Autowired private CatPhotoRepository catPhotoRepository;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient httpClient = HttpClient.newHttpClient();

  private Integer adminUserId;
  private Integer adminAuthId;
  private Integer vetUserId;
  private Integer vetAuthId;
  private Integer assistantUserId;
  private Integer assistantAuthId;
  private Integer roomId;

  private String adminEmail;
  private String vetEmail;
  private String assistantEmail;

  @BeforeEach
  void setUp() {
    adminEmail = "admin-" + UUID.randomUUID() + "@amicats.org.br";
    vetEmail = "vet-" + UUID.randomUUID() + "@amicats.org.br";
    assistantEmail = "assistant-" + UUID.randomUUID() + "@amicats.org.br";

    adminUserId = seedReadyUser("Admin de Teste", AccessType.Administrator).getId();
    adminAuthId = seedAuth(adminUserId, adminEmail);

    vetUserId = seedReadyUser("Veterinário de Teste", AccessType.Veterinarian).getId();
    vetAuthId = seedAuth(vetUserId, vetEmail);

    assistantUserId = seedReadyUser("Assistente de Teste", AccessType.Assistant).getId();
    assistantAuthId = seedAuth(assistantUserId, assistantEmail);

    roomId =
        roomRepository.save(new Room("Sala de Teste " + UUID.randomUUID(), null, null, 4)).getId();
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
    // Cats created in a test carry a FK to whichever seeded user created them (and some carry no
    // room at all), so cleanup must key off the creator, not the room.
    var testUserIds = java.util.Set.of(adminUserId, vetUserId, assistantUserId);
    var catIdsFromThisTest =
        catRepository.findAll().stream()
            .filter(
                cat ->
                    cat.getCreatedBy() != null && testUserIds.contains(cat.getCreatedBy().getId()))
            .map(org.amicats.backend.domain.entity.Cat::getId)
            .toList();

    catPhotoRepository.deleteAll(
        catPhotoRepository.findAll().stream()
            .filter(photo -> catIdsFromThisTest.contains(photo.getCat().getId()))
            .toList());
    catRepository.deleteAllById(catIdsFromThisTest);
    roomRepository.deleteById(roomId);
    userAuthRepository.deleteById(assistantAuthId);
    userRepository.deleteById(assistantUserId);
    userAuthRepository.deleteById(vetAuthId);
    userRepository.deleteById(vetUserId);
    userAuthRepository.deleteById(adminAuthId);
    userRepository.deleteById(adminUserId);
  }

  @Test
  void anAdministratorCanCreateACatInARoom() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response = send("POST", "/cats", adminToken, catBody("Mingau", roomId));
    assertThat(response.statusCode()).isEqualTo(201);

    Map<String, Object> body = parse(response);
    assertThat(body.get("name")).isEqualTo("Mingau");
    assertThat(body.get("roomId")).isEqualTo(roomId);
    assertThat(body.get("clinicalStatus")).isEqualTo("InTriage");
    assertThat(body.get("photoUrls")).isEqualTo(java.util.List.of());
  }

  @Test
  void aVeterinarianCanAlsoCreateACat() throws Exception {
    String vetToken = loginAndGetToken(vetEmail);

    HttpResponse<String> response = send("POST", "/cats", vetToken, catBody("Zeca", null));

    assertThat(response.statusCode()).isEqualTo(201);
  }

  @Test
  void anAssistantCannotCreateACat() throws Exception {
    String assistantToken = loginAndGetToken(assistantEmail);

    HttpResponse<String> response = send("POST", "/cats", assistantToken, catBody("Mel", null));

    assertThat(response.statusCode()).isEqualTo(403);
  }

  @Test
  void creatingACatWithAnInexistentRoomFails() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response =
        send("POST", "/cats", adminToken, catBody("Fantasma", 999999999));

    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  void creatingACatWithoutANameFails() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response = send("POST", "/cats", adminToken, catBody(null, null));

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void anyAuthenticatedRoleCanReadACatById() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    Integer catId =
        ((Number) parse(send("POST", "/cats", adminToken, catBody("Amora", null))).get("id"))
            .intValue();

    String assistantToken = loginAndGetToken(assistantEmail);
    HttpResponse<String> response = get("/cats/" + catId, assistantToken);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(parse(response).get("name")).isEqualTo("Amora");
  }

  private Map<String, Object> catBody(String name, Integer roomId) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("name", name);
    body.put("roomId", roomId);
    body.put("sex", "Female");
    body.put("fiv", "Negative");
    body.put("felv", "Negative");
    body.put("pif", "Untested");
    body.put("neutered", "No");
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
}
