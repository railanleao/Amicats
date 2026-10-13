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
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.enums.Sex;
import org.amicats.backend.repository.cat.CatRepository;
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
class HealthProcedureFlowIntegrationTest {

  private static final String PASSWORD = "SenhaForte123!";
  private static final LocalDate TODAY = LocalDate.now(ZoneId.of("America/Campo_Grande"));

  @LocalServerPort private int port;

  @Autowired private UserRepository userRepository;
  @Autowired private UserAuthRepository userAuthRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private CatRepository catRepository;
  @Autowired private JdbcTemplate jdbcTemplate;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient httpClient = HttpClient.newHttpClient();

  private User assistantUser;
  private Integer assistantAuthId;
  private User viewerUser;
  private Integer viewerAuthId;
  private Integer catId;

  private String assistantEmail;
  private String viewerEmail;

  @BeforeEach
  void setUp() {
    assistantEmail = "assistant-" + UUID.randomUUID() + "@amicats.org.br";
    viewerEmail = "viewer-" + UUID.randomUUID() + "@amicats.org.br";

    assistantUser = seedReadyUser("Assistente de Teste", AccessType.Assistant);
    assistantAuthId = seedAuth(assistantUser.getId(), assistantEmail);

    viewerUser = seedReadyUser("Visualizador de Teste", AccessType.Viewer);
    viewerAuthId = seedAuth(viewerUser.getId(), viewerEmail);

    catId = seedCat("Gato" + UUID.randomUUID().toString().replace("-", "")).getId();
  }

  @AfterEach
  void tearDown() {
    jdbcTemplate.update(
        "delete from health_procedure_changes where id_health_procedure in "
            + "(select id_health_procedure from health_procedures where id_cat = ?)",
        catId);
    jdbcTemplate.update("delete from health_procedures where id_cat = ?", catId);
    catRepository.deleteById(catId);
    userAuthRepository.deleteById(viewerAuthId);
    userRepository.deleteById(viewerUser.getId());
    userAuthRepository.deleteById(assistantAuthId);
    userRepository.deleteById(assistantUser.getId());
  }

  @Test
  void anAssistantCanScheduleAVaccine() throws Exception {
    String token = loginAndGetToken(assistantEmail);

    HttpResponse<String> response =
        send("POST", "/health-procedures", token, procedureBody("Vaccine", "Antirrábica", TODAY));

    assertThat(response.statusCode()).isEqualTo(201);
    Map<String, Object> body = parse(response);
    assertThat(body.get("status")).isEqualTo("Scheduled");
    assertThat(body.get("overdue")).isEqualTo(false);
    assertThat(body.get("createdByName")).isEqualTo("Assistente de Teste");
  }

  @Test
  void aViewerCanReadButCannotSchedule() throws Exception {
    String viewerToken = loginAndGetToken(viewerEmail);

    HttpResponse<String> createResponse =
        send("POST", "/health-procedures", viewerToken, procedureBody("Vaccine", "V4", TODAY));
    HttpResponse<String> listResponse = get("/health-procedures?catId=" + catId, viewerToken);

    assertThat(createResponse.statusCode()).isEqualTo(403);
    assertThat(listResponse.statusCode()).isEqualTo(200);
  }

  @Test
  void recordsEveryChangeAndSchedulesTheBooster() throws Exception {
    String token = loginAndGetToken(assistantEmail);
    Integer id = createAndGetId(token, procedureBody("Vaccine", "Antirrábica", TODAY.plusDays(2)));

    Map<String, Object> update = new LinkedHashMap<>();
    update.put("name", "Antirrábica");
    update.put("scheduledDate", TODAY.toString());
    update.put("notes", null);
    assertThat(send("PUT", "/health-procedures/" + id, token, update).statusCode()).isEqualTo(200);

    Map<String, Object> complete = new LinkedHashMap<>();
    complete.put("completedDate", TODAY.toString());
    complete.put("notes", null);
    complete.put("boosterDate", TODAY.plusYears(1).toString());
    HttpResponse<String> completeResponse =
        send("PATCH", "/health-procedures/" + id + "/complete", token, complete);
    assertThat(completeResponse.statusCode()).isEqualTo(200);
    assertThat(parse(completeResponse).get("status")).isEqualTo("Completed");

    List<Map<String, Object>> changes =
        parseList(get("/health-procedures/" + id + "/changes", token));
    assertThat(changes)
        .extracting(change -> change.get("action"))
        .containsExactlyInAnyOrder("Created", "Updated", "Completed");
    assertThat(changes)
        .anySatisfy(
            change -> {
              assertThat(change.get("field")).isEqualTo("ScheduledDate");
              assertThat(change.get("oldValue")).isEqualTo(TODAY.plusDays(2).toString());
              assertThat(change.get("newValue")).isEqualTo(TODAY.toString());
              assertThat(change.get("userName")).isEqualTo("Assistente de Teste");
            });

    List<Map<String, Object>> scheduled =
        contentOf(parse(get("/health-procedures?status=Scheduled&catId=" + catId, token)));
    assertThat(scheduled)
        .singleElement()
        .satisfies(
            booster -> {
              assertThat(booster.get("previousHealthProcedureId")).isEqualTo(id);
              assertThat(booster.get("scheduledDate")).isEqualTo(TODAY.plusYears(1).toString());
            });

    Map<String, Object> summary = parse(get("/cats/" + catId + "/health-summary", token));
    @SuppressWarnings("unchecked")
    Map<String, Object> lastVaccine = (Map<String, Object>) summary.get("lastVaccine");
    assertThat(lastVaccine.get("id")).isEqualTo(id);
  }

  @Test
  void aCompletedProcedureCannotBeCancelled() throws Exception {
    String token = loginAndGetToken(assistantEmail);
    Integer id = createAndGetId(token, procedureBody("Deworming", "Drontal", TODAY));

    Map<String, Object> complete = new LinkedHashMap<>();
    complete.put("completedDate", TODAY.toString());
    send("PATCH", "/health-procedures/" + id + "/complete", token, complete);

    HttpResponse<String> response =
        send("PATCH", "/health-procedures/" + id + "/cancel", token, Map.of("reason", "Engano"));

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void aBoosterIsOnlyAllowedForVaccines() throws Exception {
    String token = loginAndGetToken(assistantEmail);
    Integer id = createAndGetId(token, procedureBody("Deworming", "Drontal", TODAY));

    Map<String, Object> complete = new LinkedHashMap<>();
    complete.put("completedDate", TODAY.toString());
    complete.put("boosterDate", TODAY.plusMonths(3).toString());

    HttpResponse<String> response =
        send("PATCH", "/health-procedures/" + id + "/complete", token, complete);

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void cancellingRequiresAReason() throws Exception {
    String token = loginAndGetToken(assistantEmail);
    Integer id = createAndGetId(token, procedureBody("Vaccine", "V4", TODAY));

    HttpResponse<String> response =
        send("PATCH", "/health-procedures/" + id + "/cancel", token, Map.of("reason", " "));

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void neuteringDrivesTheCatStatusAndBlocksDuplicates() throws Exception {
    String token = loginAndGetToken(assistantEmail);
    Integer id = createAndGetId(token, procedureBody("Neutering", null, TODAY));

    assertThat(parse(get("/cats/" + catId + "/health-summary", token)).get("neuteringStatus"))
        .isEqualTo("Scheduled");

    HttpResponse<String> duplicate =
        send("POST", "/health-procedures", token, procedureBody("Neutering", null, TODAY));
    assertThat(duplicate.statusCode()).isEqualTo(409);

    HttpResponse<String> cancel =
        send(
            "PATCH",
            "/health-procedures/" + id + "/cancel",
            token,
            Map.of("reason", "Falta de verba"));
    assertThat(cancel.statusCode()).isEqualTo(200);
    assertThat(parse(get("/cats/" + catId + "/health-summary", token)).get("neuteringStatus"))
        .isEqualTo("NotNeutered");
  }

  @Test
  void aSchedulingDateInThePastIsRejected() throws Exception {
    String token = loginAndGetToken(assistantEmail);

    HttpResponse<String> response =
        send(
            "POST",
            "/health-procedures",
            token,
            procedureBody("Vaccine", "V4", TODAY.minusDays(1)));

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void searchingForAWildcardDoesNotMatchEverything() throws Exception {
    String token = loginAndGetToken(assistantEmail);
    createAndGetId(token, procedureBody("Vaccine", "Antirrábica", TODAY));

    List<Map<String, Object>> result =
        contentOf(parse(get("/health-procedures?catId=" + catId + "&search=_", token)));

    assertThat(result).isEmpty();
  }

  private Map<String, Object> procedureBody(String type, String name, LocalDate scheduledDate) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("catId", catId);
    body.put("type", type);
    body.put("name", name);
    body.put("scheduledDate", scheduledDate.toString());
    body.put("notes", null);
    return body;
  }

  private Integer createAndGetId(String token, Map<String, Object> body) throws Exception {
    HttpResponse<String> response = send("POST", "/health-procedures", token, body);
    assertThat(response.statusCode()).isEqualTo(201);
    return ((Number) parse(response).get("id")).intValue();
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

  private Cat seedCat(String name) {
    return catRepository.save(
        new Cat(
            name,
            null,
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
            assistantUser));
  }

  private String loginAndGetToken(String email) throws Exception {
    return (String)
        parse(send("POST", "/auth/login", null, Map.of("email", email, "password", PASSWORD)))
            .get("token");
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

  @SuppressWarnings("unchecked")
  private List<Map<String, Object>> contentOf(Map<String, Object> page) {
    return (List<Map<String, Object>>) page.get("content");
  }
}
