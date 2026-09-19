package org.amicats.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
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
 * Boots the whole Spring context on a real HTTP server to prove GET /users and PATCH /users/{id}
 * are actually reachable only by an Administrator and behave as the frontend expects — unit tests
 * of the use cases alone don't exercise SecurityConfig, JSON serialization, or routing.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"app.rate-limit.sensitive.capacity=1000", "app.rate-limit.default.capacity=1000"})
class UserManagementFlowIntegrationTest {

  private static final String PASSWORD = "SenhaForte123!";

  @LocalServerPort private int port;

  @Autowired private UserRepository userRepository;
  @Autowired private UserAuthRepository userAuthRepository;
  @Autowired private PasswordEncoder passwordEncoder;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient httpClient = HttpClient.newHttpClient();

  private Integer adminUserId;
  private Integer adminAuthId;
  private Integer assistantUserId;
  private Integer assistantAuthId;
  private Integer targetUserId;
  private Integer targetAuthId;

  private String adminEmail;
  private String assistantEmail;

  @BeforeEach
  void setUp() {
    adminEmail = "admin-" + UUID.randomUUID() + "@amicats.org.br";
    assistantEmail = "assistant-" + UUID.randomUUID() + "@amicats.org.br";
    String targetEmail = "target-" + UUID.randomUUID() + "@amicats.org.br";

    adminUserId = seedReadyUser("Admin de Teste", AccessType.Administrator).getId();
    adminAuthId = seedAuth(adminUserId, adminEmail);

    assistantUserId = seedReadyUser("Assistente de Teste", AccessType.Assistant).getId();
    assistantAuthId = seedAuth(assistantUserId, assistantEmail);

    targetUserId = seedReadyUser("Usuário Alvo", AccessType.Veterinarian).getId();
    targetAuthId = seedAuth(targetUserId, targetEmail);
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
    userAuthRepository.deleteById(targetAuthId);
    userRepository.deleteById(targetUserId);
    userAuthRepository.deleteById(assistantAuthId);
    userRepository.deleteById(assistantUserId);
    userAuthRepository.deleteById(adminAuthId);
    userRepository.deleteById(adminUserId);
  }

  @Test
  void anAdministratorCanListAndDeactivateAUser() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> listResponse = get("/users", adminToken);
    assertThat(listResponse.statusCode()).isEqualTo(200);
    List<Map<String, Object>> users = parseList(listResponse);
    assertThat(users)
        .anySatisfy(
            user -> {
              assertThat(user.get("id")).isEqualTo(targetUserId);
              assertThat(user.get("active")).isEqualTo(true);
            });

    HttpResponse<String> deactivateResponse = patch("/users/" + targetUserId, adminToken);
    assertThat(deactivateResponse.statusCode()).isEqualTo(204);

    HttpResponse<String> afterResponse = get("/users/" + targetUserId, adminToken);
    Map<String, Object> afterUser = parse(afterResponse);
    assertThat(afterUser.get("active")).isEqualTo(false);
  }

  @Test
  void aNonAdministratorCannotListUsers() throws Exception {
    String assistantToken = loginAndGetToken(assistantEmail);

    HttpResponse<String> response = get("/users", assistantToken);

    assertThat(response.statusCode()).isEqualTo(403);
  }

  @Test
  void deactivatingAnUnknownUserReturnsNotFound() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response = patch("/users/999999999", adminToken);

    assertThat(response.statusCode()).isEqualTo(404);
  }

  private String loginAndGetToken(String email) throws Exception {
    HttpRequest request =
        HttpRequest.newBuilder()
            .uri(URI.create(baseUrl() + "/auth/login"))
            .header("Content-Type", "application/json")
            .POST(
                BodyPublishers.ofString(
                    objectMapper.writeValueAsString(Map.of("email", email, "password", PASSWORD))))
            .build();
    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    return (String) parse(response).get("token");
  }

  private String baseUrl() {
    return "http://localhost:" + port;
  }

  private HttpResponse<String> get(String path, String token) throws Exception {
    HttpRequest request =
        HttpRequest.newBuilder()
            .uri(URI.create(baseUrl() + path))
            .header("Authorization", "Bearer " + token)
            .GET()
            .build();
    return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
  }

  private HttpResponse<String> patch(String path, String token) throws Exception {
    HttpRequest request =
        HttpRequest.newBuilder()
            .uri(URI.create(baseUrl() + path))
            .header("Authorization", "Bearer " + token)
            .method("PATCH", BodyPublishers.noBody())
            .build();
    return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> parse(HttpResponse<String> response) throws Exception {
    return objectMapper.readValue(response.body(), Map.class);
  }

  private List<Map<String, Object>> parseList(HttpResponse<String> response) throws Exception {
    return objectMapper.readValue(response.body(), new TypeReference<>() {});
  }
}
