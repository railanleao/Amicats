package org.amicats.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.Properties;
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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * Boots the whole Spring context with a mocked JavaMailSender — no real SMTP call ever leaves this
 * test — to prove /auth/forgot-password always answers 204 and never reveals whether an account
 * exists, matching the same real-HTTP black-box approach as AuthOnboardingFlowIntegrationTest.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"app.rate-limit.sensitive.capacity=1000", "app.rate-limit.default.capacity=1000"})
class ForgotPasswordFlowIntegrationTest {

  private static final String PASSWORD = "SenhaAtual123!";

  @LocalServerPort private int port;

  @Autowired private UserRepository userRepository;
  @Autowired private UserAuthRepository userAuthRepository;
  @Autowired private PasswordEncoder passwordEncoder;

  @MockitoBean private JavaMailSender javaMailSender;

  private final HttpClient httpClient = HttpClient.newHttpClient();

  private String email;
  private Integer userId;
  private Integer authId;

  @BeforeEach
  void setUp() {
    email = "forgot-" + UUID.randomUUID() + "@amicats.org.br";

    User user =
        userRepository.save(
            new User("Teste Recuperação", null, null, AccessType.Assistant, null, null, null));
    userId = user.getId();

    UserAuth auth = new UserAuth(user, email, passwordEncoder.encode(PASSWORD));
    authId = userAuthRepository.save(auth).getId();

    when(javaMailSender.createMimeMessage())
        .thenAnswer(invocation -> new MimeMessage(Session.getDefaultInstance(new Properties())));
  }

  @AfterEach
  void tearDown() {
    userAuthRepository.deleteById(authId);
    userRepository.deleteById(userId);
  }

  @Test
  void respondsNoContentAndSendsAnEmailForARegisteredAddress() throws Exception {
    HttpResponse<String> response = post(Map.of("email", email));

    assertThat(response.statusCode()).isEqualTo(204);
    verify(javaMailSender).send(any(MimeMessage.class));
  }

  @Test
  void respondsNoContentWithoutSendingAnyEmailForAnUnregisteredAddress() throws Exception {
    HttpResponse<String> response =
        post(Map.of("email", "nao-existe-" + UUID.randomUUID() + "@amicats.org.br"));

    assertThat(response.statusCode()).isEqualTo(204);
    verify(javaMailSender, never()).send(any(MimeMessage.class));
  }

  @Test
  void rejectsAMalformedEmailWithBadRequest() throws Exception {
    HttpResponse<String> response = post(Map.of("email", "not-an-email"));

    assertThat(response.statusCode()).isEqualTo(400);
    verify(javaMailSender, never()).send(any(MimeMessage.class));
  }

  @Test
  void doesNotSendASecondEmailWithinTheCooldownWindow() throws Exception {
    post(Map.of("email", email));

    HttpResponse<String> secondResponse = post(Map.of("email", email));

    assertThat(secondResponse.statusCode()).isEqualTo(204);
    verify(javaMailSender, times(1)).send(any(MimeMessage.class));
  }

  private HttpResponse<String> post(Object body) throws Exception {
    HttpRequest request =
        HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:" + port + "/auth/forgot-password"))
            .header("Content-Type", "application/json")
            .POST(BodyPublishers.ofString(toJson(body)))
            .build();
    return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
  }

  @SuppressWarnings("unchecked")
  private String toJson(Object body) {
    Map<String, Object> map = (Map<String, Object>) body;
    return "{\"email\":\"" + map.get("email") + "\"}";
  }
}
