package org.amicats.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
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
 * Sobe o contexto Spring inteiro (SecurityConfig, RateLimitFilter, controllers reais) num servidor
 * HTTP de verdade — diferente dos testes unitários das outras classes, que mockam as dependências e
 * não provam que a cadeia de segurança está de fato ligada do jeito certo. Cobre especificamente
 * dois bugs reais encontrados nesta sessão: o /error devolvendo 403 em vez do erro de negócio
 * (mesma authority ONBOARDING_PENDING bloqueando o forward de erro), e o PATCH sendo obrigatório em
 * /auth/change-password.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    // Capacidade de rate limit bem acima do normal: os vários métodos desta classe batem no
    // mesmo bucket "sensitive" (mesmo IP, mesmo minuto), e o rate limit em si já tem cobertura
    // dedicada e determinística em RateLimitFilterTest — aqui o foco é a integração ponta a
    // ponta, não o limite de requisições.
    properties = {"app.rate-limit.sensitive.capacity=1000", "app.rate-limit.default.capacity=1000"})
class AuthOnboardingFlowIntegrationTest {

  private static final String TEMP_PASSWORD = "SenhaTemp123!";
  private static final String NEW_PASSWORD = "NovaSenhaForte1!";

  @LocalServerPort private int port;

  @Autowired private UserRepository userRepository;
  @Autowired private UserAuthRepository userAuthRepository;
  @Autowired private PasswordEncoder passwordEncoder;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient httpClient = HttpClient.newHttpClient();

  private String email;
  private Integer userId;
  private Integer authId;

  @BeforeEach
  void setUp() {
    email = "onboarding-" + UUID.randomUUID() + "@amicats.org.br";

    User user =
        userRepository.save(
            new User("Teste Integração", null, null, AccessType.Administrator, null, null, null));
    userId = user.getId();

    UserAuth auth = new UserAuth(user, email, passwordEncoder.encode(TEMP_PASSWORD));
    auth.setMustChangePassword(true);
    authId = userAuthRepository.save(auth).getId();
  }

  @AfterEach
  void tearDown() {
    userAuthRepository.deleteById(authId);
    userRepository.deleteById(userId);
  }

  @Test
  void fullOnboardingFlowUnlocksAccessAndBlocksBeforeCompletion() throws Exception {
    HttpResponse<String> login =
        post("/auth/login", "POST", null, Map.of("email", email, "password", TEMP_PASSWORD));
    assertThat(login.statusCode()).isEqualTo(200);
    Map<String, Object> loginBody = parse(login);
    assertThat(loginBody.get("termsAccepted")).isEqualTo(false);
    assertThat(loginBody.get("mustChangePassword")).isEqualTo(true);
    String tokenAfterLogin = (String) loginBody.get("token");

    assertThat(get("/users", tokenAfterLogin).statusCode()).isEqualTo(403);

    HttpResponse<String> acceptTerms = post("/auth/accept-terms", "POST", tokenAfterLogin, null);
    assertThat(acceptTerms.statusCode()).isEqualTo(200);
    Map<String, Object> acceptBody = parse(acceptTerms);
    assertThat(acceptBody.get("termsAccepted")).isEqualTo(true);
    assertThat(acceptBody.get("mustChangePassword")).isEqualTo(true);
    String tokenAfterTerms = (String) acceptBody.get("token");

    assertThat(get("/users", tokenAfterTerms).statusCode()).isEqualTo(403);

    HttpResponse<String> wrongPassword =
        post(
            "/auth/change-password",
            "PATCH",
            tokenAfterTerms,
            Map.of(
                "currentPassword", "senha-errada",
                "newPassword", NEW_PASSWORD,
                "confirmNewPassword", NEW_PASSWORD));
    // Regressão do bug do /error: sem o fix, uma exceção de negócio aqui voltava 403
    // (bloqueada pela mesma authority ONBOARDING_PENDING) em vez do 400 de verdade.
    assertThat(wrongPassword.statusCode()).isEqualTo(400);

    HttpResponse<String> changePassword =
        post(
            "/auth/change-password",
            "PATCH",
            tokenAfterTerms,
            Map.of(
                "currentPassword", TEMP_PASSWORD,
                "newPassword", NEW_PASSWORD,
                "confirmNewPassword", NEW_PASSWORD));
    assertThat(changePassword.statusCode()).isEqualTo(200);
    Map<String, Object> changeBody = parse(changePassword);
    assertThat(changeBody.get("mustChangePassword")).isEqualTo(false);
    String finalToken = (String) changeBody.get("token");

    assertThat(get("/users", finalToken).statusCode()).isEqualTo(200);
  }

  @Test
  void loginRejectsMalformedEmailWithBadRequest() throws Exception {
    HttpResponse<String> response =
        post("/auth/login", "POST", null, Map.of("email", "not-an-email", "password", "x"));

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void loginRejectsAnOversizedPasswordWithBadRequest() throws Exception {
    // BCrypt trunca em 72 bytes de qualquer forma; sem esse limite, o passwordEncoder.matches(...)
    // aceitaria um payload gigante e gastaria processamento à toa a cada tentativa.
    String oversizedPassword = "a".repeat(5000);

    HttpResponse<String> response =
        post("/auth/login", "POST", null, Map.of("email", email, "password", oversizedPassword));

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void changePasswordRejectsAnOversizedCurrentPassword() throws Exception {
    HttpResponse<String> login =
        post("/auth/login", "POST", null, Map.of("email", email, "password", TEMP_PASSWORD));
    String token = (String) parse(login).get("token");
    String oversizedPassword = "a".repeat(5000);

    HttpResponse<String> response =
        post(
            "/auth/change-password",
            "PATCH",
            token,
            Map.of(
                "currentPassword", oversizedPassword,
                "newPassword", NEW_PASSWORD,
                "confirmNewPassword", NEW_PASSWORD));

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void changePasswordRejectsPostRequiringPatch() throws Exception {
    HttpResponse<String> login =
        post("/auth/login", "POST", null, Map.of("email", email, "password", TEMP_PASSWORD));
    String token = (String) parse(login).get("token");

    HttpResponse<String> response =
        post(
            "/auth/change-password",
            "POST",
            token,
            Map.of(
                "currentPassword", TEMP_PASSWORD,
                "newPassword", NEW_PASSWORD,
                "confirmNewPassword", NEW_PASSWORD));

    assertThat(response.statusCode()).isEqualTo(405);
  }

  private String baseUrl() {
    return "http://localhost:" + port;
  }

  private HttpResponse<String> post(String path, String method, String token, Object body)
      throws Exception {
    HttpRequest.Builder builder =
        HttpRequest.newBuilder()
            .uri(URI.create(baseUrl() + path))
            .header("Content-Type", "application/json");
    if (token != null) {
      builder.header("Authorization", "Bearer " + token);
    }
    builder.method(
        method,
        body == null
            ? BodyPublishers.noBody()
            : BodyPublishers.ofString(objectMapper.writeValueAsString(body)));
    return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
  }

  private HttpResponse<String> get(String path, String token) throws Exception {
    HttpRequest.Builder builder = HttpRequest.newBuilder().uri(URI.create(baseUrl() + path)).GET();
    if (token != null) {
      builder.header("Authorization", "Bearer " + token);
    }
    return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> parse(HttpResponse<String> response) throws Exception {
    return objectMapper.readValue(response.body(), Map.class);
  }
}
