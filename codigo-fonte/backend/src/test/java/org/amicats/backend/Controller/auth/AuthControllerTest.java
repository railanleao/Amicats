package org.amicats.backend.Controller.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.usecase.userauth.LoginResponse;
import org.amicats.backend.repository.user.UserAuthRepository;
import org.amicats.backend.repository.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"app.rate-limit.sensitive.capacity=1000", "app.rate-limit.default.capacity=1000"})
class AuthControllerTest {

  @LocalServerPort private int port;

  @Autowired private UserRepository userRepository;

  @Autowired private UserAuthRepository userAuthRepository;

  @Autowired private PasswordEncoder passwordEncoder;

  private HttpClient httpClient;
  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() {
    httpClient = HttpClient.newHttpClient();
    objectMapper = new ObjectMapper();
  }

  @AfterEach
  void cleanUp() {
    userAuthRepository.deleteAll();
    userRepository.deleteAll();
  }

  private UserAuth createUser() {

    User user =
        new User(
            "Marina Alves",
            null,
            null,
            AccessType.Administrator,
            null,
            null,
            LocalDateTime.now(ZoneOffset.UTC));

    user = userRepository.save(user);

    UserAuth auth =
        new UserAuth(user, "marina.alves@amicats.org.br", passwordEncoder.encode("senha-forte"));

    return userAuthRepository.save(auth);
  }

  @Test
  void logsInWithValidCredentials() throws Exception {

    createUser();

    String body =
        """
        {
          "email": "marina.alves@amicats.org.br",
          "password": "senha-forte"
        }
        """;

    HttpRequest request =
        HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:" + port + "/auth/login"))
            .header("Content-Type", "application/json")
            .POST(BodyPublishers.ofString(body))
            .build();

    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

    assertThat(response.statusCode()).isEqualTo(200);

    LoginResponse loginResponse = objectMapper.readValue(response.body(), LoginResponse.class);

    assertThat(loginResponse.token()).isNotBlank();

    assertThat(loginResponse.name()).isEqualTo("Marina Alves");

    assertThat(loginResponse.accessType()).isEqualTo(AccessType.Administrator);
  }
}
