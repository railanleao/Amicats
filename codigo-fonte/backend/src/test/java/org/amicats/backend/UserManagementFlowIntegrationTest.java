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
 * Boots the whole Spring context on a real HTTP server to prove the /users endpoints (list, read,
 * update and status change) are actually reachable only by an Administrator and behave as the
 * frontend expects — unit tests of the use cases alone don't exercise SecurityConfig, JSON
 * serialization, routing, validation or the JPQL search query.
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
  private String targetEmail;
  private String targetNameToken;

  @BeforeEach
  void setUp() {
    adminEmail = "admin-" + UUID.randomUUID() + "@amicats.org.br";
    assistantEmail = "assistant-" + UUID.randomUUID() + "@amicats.org.br";
    targetEmail = "target-" + UUID.randomUUID() + "@amicats.org.br";
    targetNameToken = "Alvo" + UUID.randomUUID().toString().replace("-", "");

    adminUserId = seedReadyUser("Admin de Teste", AccessType.Administrator).getId();
    adminAuthId = seedAuth(adminUserId, adminEmail);

    assistantUserId = seedReadyUser("Assistente de Teste", AccessType.Assistant).getId();
    assistantAuthId = seedAuth(assistantUserId, assistantEmail);

    targetUserId = seedReadyUser(targetNameToken, AccessType.Veterinarian).getId();
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

    HttpResponse<String> listResponse = get("/users?search=" + targetNameToken, adminToken);
    assertThat(listResponse.statusCode()).isEqualTo(200);
    List<Map<String, Object>> users = contentOf(parsePage(listResponse));
    assertThat(users)
        .anySatisfy(
            user -> {
              assertThat(user.get("id")).isEqualTo(targetUserId);
              assertThat(user.get("active")).isEqualTo(true);
            });

    HttpResponse<String> deactivateResponse = changeStatus(targetUserId, false, adminToken);
    assertThat(deactivateResponse.statusCode()).isEqualTo(204);

    HttpResponse<String> afterResponse = get("/users/" + targetUserId, adminToken);
    Map<String, Object> afterUser = parse(afterResponse);
    assertThat(afterUser.get("active")).isEqualTo(false);
  }

  @Test
  void anAdministratorCanReactivateADeactivatedUser() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    String path = "/users/" + targetUserId;

    assertThat(changeStatus(targetUserId, false, adminToken).statusCode()).isEqualTo(204);
    assertThat(parse(get(path, adminToken)).get("active")).isEqualTo(false);

    assertThat(changeStatus(targetUserId, true, adminToken).statusCode()).isEqualTo(204);
    assertThat(parse(get(path, adminToken)).get("active")).isEqualTo(true);
  }

  @Test
  void aDeactivatedUserCannotLogInUntilReactivated() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    assertThat(changeStatus(targetUserId, false, adminToken).statusCode()).isEqualTo(204);
    HttpResponse<String> rejected = login(targetEmail);
    assertThat(rejected.statusCode()).isNotEqualTo(200);
    assertThat(rejected.body()).doesNotContain("\"token\"");

    assertThat(changeStatus(targetUserId, true, adminToken).statusCode()).isEqualTo(204);
    assertThat(login(targetEmail).statusCode()).isEqualTo(200);
  }

  @Test
  void aNonAdministratorCannotListUsers() throws Exception {
    String assistantToken = loginAndGetToken(assistantEmail);

    HttpResponse<String> response = get("/users", assistantToken);

    assertThat(response.statusCode()).isEqualTo(403);
  }

  @Test
  void aNonAdministratorCannotChangeUserStatus() throws Exception {
    String assistantToken = loginAndGetToken(assistantEmail);

    HttpResponse<String> response = changeStatus(targetUserId, false, assistantToken);

    assertThat(response.statusCode()).isEqualTo(403);
  }

  @Test
  void deactivatingAnUnknownUserReturnsNotFound() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response = changeStatus(999999999, false, adminToken);

    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  void changingStatusWithoutTheActiveFieldReturnsBadRequest() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response =
        send("PATCH", "/users/" + targetUserId + "/status", adminToken, Map.of());

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void anAdministratorCannotDeactivateThemselves() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response = changeStatus(adminUserId, false, adminToken);

    assertThat(response.statusCode()).isEqualTo(409);
    assertThat(parse(get("/users/" + adminUserId, adminToken)).get("active")).isEqualTo(true);
  }

  @Test
  void anAdministratorCanEditTheirOwnDataButNotTheirOwnAccessType() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    String path = "/users/" + adminUserId;

    HttpResponse<String> renamed =
        put(
            path,
            adminToken,
            updateBody("Admin Renomeado", null, AccessType.Administrator, null, null));
    assertThat(renamed.statusCode()).isEqualTo(200);
    assertThat(parse(renamed).get("fullName")).isEqualTo("Admin Renomeado");

    HttpResponse<String> demoted =
        put(path, adminToken, updateBody("Admin Renomeado", null, AccessType.Viewer, null, null));
    assertThat(demoted.statusCode()).isEqualTo(409);
    assertThat(parse(get(path, adminToken)).get("accessType")).isEqualTo("Administrator");
  }

  @Test
  void updateReplacesAllFieldsAndAllowsClearingTheOptionalOnes() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    String path = "/users/" + targetUserId;

    HttpResponse<String> filled =
        put(
            path,
            adminToken,
            updateBody(targetNameToken, "67999999999", AccessType.Veterinarian, "12345", "MS"));
    assertThat(filled.statusCode()).isEqualTo(200);
    Map<String, Object> filledUser = parse(filled);
    assertThat(filledUser.get("phoneNumber")).isEqualTo("67999999999");
    assertThat(filledUser.get("crmv")).isEqualTo("12345");
    assertThat(filledUser.get("ufCrmv")).isEqualTo("MS");

    HttpResponse<String> cleared =
        put(path, adminToken, updateBody(targetNameToken, null, AccessType.Assistant, null, null));
    assertThat(cleared.statusCode()).isEqualTo(200);

    Map<String, Object> reloaded = parse(get(path, adminToken));
    assertThat(reloaded.get("phoneNumber")).isNull();
    assertThat(reloaded.get("crmv")).isNull();
    assertThat(reloaded.get("ufCrmv")).isNull();
    assertThat(reloaded.get("accessType")).isEqualTo("Assistant");
  }

  @Test
  void loggingInRegistersTheLastLogin() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    String path = "/users/" + targetUserId;

    assertThat(parse(get(path, adminToken)).get("lastLoginAt")).isNull();

    loginAndGetToken(targetEmail);

    assertThat(parse(get(path, adminToken)).get("lastLoginAt")).isNotNull();
  }

  @Test
  void searchMatchesByNameOrEmailSubstring() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    List<Map<String, Object>> byName =
        contentOf(parsePage(get("/users?search=" + targetNameToken, adminToken)));
    assertThat(byName).extracting(user -> user.get("id")).containsExactly(targetUserId);

    String emailToken = targetEmail.substring(0, targetEmail.indexOf('@'));
    List<Map<String, Object>> byEmail =
        contentOf(parsePage(get("/users?search=" + emailToken, adminToken)));
    assertThat(byEmail).extracting(user -> user.get("id")).containsExactly(targetUserId);
  }

  @Test
  void filtersByAccessTypeAndActiveStatus() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    List<Map<String, Object>> matchingType =
        contentOf(
            parsePage(
                get("/users?search=" + targetNameToken + "&accessType=Veterinarian", adminToken)));
    assertThat(matchingType).hasSize(1);

    List<Map<String, Object>> nonMatchingType =
        contentOf(
            parsePage(
                get("/users?search=" + targetNameToken + "&accessType=Administrator", adminToken)));
    assertThat(nonMatchingType).isEmpty();

    assertThat(changeStatus(targetUserId, false, adminToken).statusCode()).isEqualTo(204);

    List<Map<String, Object>> activeOnly =
        contentOf(parsePage(get("/users?search=" + targetNameToken + "&active=true", adminToken)));
    assertThat(activeOnly).isEmpty();

    List<Map<String, Object>> inactiveOnly =
        contentOf(parsePage(get("/users?search=" + targetNameToken + "&active=false", adminToken)));
    assertThat(inactiveOnly).extracting(user -> user.get("id")).containsExactly(targetUserId);
  }

  @Test
  void paginatesResultsAcrossPages() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    String pageToken = "Pag" + UUID.randomUUID().toString().replace("-", "");

    User first = seedReadyUser(pageToken + "A", AccessType.Viewer);
    Integer firstAuthId = seedAuth(first.getId(), "pag-a-" + UUID.randomUUID() + "@amicats.org.br");
    User second = seedReadyUser(pageToken + "B", AccessType.Viewer);
    Integer secondAuthId =
        seedAuth(second.getId(), "pag-b-" + UUID.randomUUID() + "@amicats.org.br");

    try {
      Map<String, Object> firstPage =
          parsePage(get("/users?search=" + pageToken + "&page=0&size=1", adminToken));
      assertThat(contentOf(firstPage)).hasSize(1);
      assertThat(firstPage.get("totalElements")).isEqualTo(2);
      assertThat(firstPage.get("totalPages")).isEqualTo(2);
      assertThat(firstPage.get("page")).isEqualTo(0);
      assertThat(firstPage.get("size")).isEqualTo(1);

      Map<String, Object> secondPage =
          parsePage(get("/users?search=" + pageToken + "&page=1&size=1", adminToken));
      assertThat(contentOf(secondPage)).hasSize(1);

      Object firstPageUserId = contentOf(firstPage).get(0).get("id");
      Object secondPageUserId = contentOf(secondPage).get(0).get("id");
      assertThat(List.of(firstPageUserId, secondPageUserId))
          .containsExactlyInAnyOrder(first.getId(), second.getId());
    } finally {
      userAuthRepository.deleteById(firstAuthId);
      userRepository.deleteById(first.getId());
      userAuthRepository.deleteById(secondAuthId);
      userRepository.deleteById(second.getId());
    }
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

  private HttpResponse<String> put(String path, String token, Object body) throws Exception {
    return send("PUT", path, token, body);
  }

  private HttpResponse<String> changeStatus(Integer userId, boolean active, String token)
      throws Exception {
    return send("PATCH", "/users/" + userId + "/status", token, Map.of("active", active));
  }

  private Map<String, Object> updateBody(
      String fullName, String phoneNumber, AccessType accessType, String crmv, String ufCrmv) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("fullName", fullName);
    body.put("phoneNumber", phoneNumber);
    body.put("accessType", accessType.name());
    body.put("crmv", crmv);
    body.put("ufCrmv", ufCrmv);
    return body;
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

  private Map<String, Object> parsePage(HttpResponse<String> response) throws Exception {
    return parse(response);
  }

  @SuppressWarnings("unchecked")
  private List<Map<String, Object>> contentOf(Map<String, Object> page) {
    return (List<Map<String, Object>>) page.get("content");
  }
}
