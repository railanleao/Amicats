package org.amicats.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
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
import org.amicats.backend.repository.externalattendance.ExternalAttendanceRepository;
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

/** End-to-end coverage for external attendance authorization, validation and file retrieval. */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"app.rate-limit.sensitive.capacity=1000", "app.rate-limit.default.capacity=1000"})
class ExternalAttendanceFlowIntegrationTest {

  private static final String PASSWORD = "SenhaForte123!";
  private static final String PDF = "%PDF-1.7\nAmicats test document\n%%EOF";

  @LocalServerPort private int port;

  @Autowired private UserRepository userRepository;
  @Autowired private UserAuthRepository userAuthRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private RoomRepository roomRepository;
  @Autowired private CatRepository catRepository;
  @Autowired private ExternalAttendanceRepository attendanceRepository;

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient httpClient = HttpClient.newHttpClient();

  private Integer adminUserId;
  private Integer adminAuthId;
  private Integer assistantUserId;
  private Integer assistantAuthId;
  private Integer roomId;
  private Integer catId;
  private String adminEmail;
  private String assistantEmail;

  @BeforeEach
  void setUp() {
    adminEmail = "external-admin-" + UUID.randomUUID() + "@amicats.org.br";
    assistantEmail = "external-assistant-" + UUID.randomUUID() + "@amicats.org.br";
    User admin = seedReadyUser("Admin de Teste", AccessType.Administrator);
    adminUserId = admin.getId();
    adminAuthId = seedAuth(adminUserId, adminEmail);
    User assistant = seedReadyUser("Assistente de Teste", AccessType.Assistant);
    assistantUserId = assistant.getId();
    assistantAuthId = seedAuth(assistantUserId, assistantEmail);
    Room room = roomRepository.save(new Room("Sala externa " + UUID.randomUUID(), null, null, 5));
    roomId = room.getId();
    catId = seedCat("Nina " + UUID.randomUUID(), room, admin).getId();
  }

  @AfterEach
  void tearDown() {
    if (catId != null) {
      catRepository.deleteById(catId);
    }
    if (roomId != null) {
      roomRepository.deleteById(roomId);
    }
    if (assistantAuthId != null) userAuthRepository.deleteById(assistantAuthId);
    if (assistantUserId != null) userRepository.deleteById(assistantUserId);
    if (adminAuthId != null) userAuthRepository.deleteById(adminAuthId);
    if (adminUserId != null) userRepository.deleteById(adminUserId);
  }

  @Test
  void administratorCanCreateListAndDownloadAnExternalAttendance() throws Exception {
    String token = loginAndGetToken(adminEmail);
    HttpResponse<String> create =
        createAttendance(
            catId,
            token,
            validData(),
            PDF.getBytes(StandardCharsets.US_ASCII),
            "report.pdf",
            "application/octet-stream");
    assertThat(create.statusCode()).isEqualTo(201);
    Map<String, Object> result = parse(create);
    Integer attendanceId = ((Number) result.get("id")).intValue();
    assertThat(result.get("attachmentContentType")).isEqualTo("application/pdf");
    assertThat(result.get("attachedFile")).isEqualTo("report.pdf");

    HttpResponse<String> list = get("/cats/" + catId + "/external-attendances", token);
    assertThat(list.statusCode()).isEqualTo(200);
    assertThat(list.body()).contains("Consulta de rotina").doesNotContain("attachmentData");

    HttpResponse<byte[]> download =
        getBytes("/external-attendances/" + attendanceId + "/attachment", token);
    assertThat(download.statusCode()).isEqualTo(200);
    assertThat(download.headers().firstValue("Content-Type").orElse(""))
        .startsWith("application/pdf");
    assertThat(new String(download.body(), StandardCharsets.US_ASCII)).startsWith("%PDF-");
  }

  @Test
  void assistantCannotCreateAnExternalAttendance() throws Exception {
    HttpResponse<String> response =
        createAttendance(
            catId,
            loginAndGetToken(assistantEmail),
            validData(),
            PDF.getBytes(StandardCharsets.US_ASCII),
            "report.pdf",
            "application/pdf");
    assertThat(response.statusCode()).isEqualTo(403);
  }

  @Test
  void creatingForUnknownCatReturnsNotFound() throws Exception {
    HttpResponse<String> response =
        createAttendance(
            999999999,
            loginAndGetToken(adminEmail),
            validData(),
            PDF.getBytes(StandardCharsets.US_ASCII),
            "report.pdf",
            "application/pdf");
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  void emptyAttachmentIsRejected() throws Exception {
    HttpResponse<String> response =
        createAttendance(
            catId,
            loginAndGetToken(adminEmail),
            validData(),
            new byte[0],
            "empty.pdf",
            "application/pdf");
    assertThat(response.statusCode()).isBetween(400, 499);
  }

  @Test
  void attachmentLargerThanFiveMegabytesIsRejected() throws Exception {
    byte[] oversized = new byte[(5 * 1024 * 1024) + 1];
    byte[] prefix = PDF.getBytes(StandardCharsets.US_ASCII);
    System.arraycopy(prefix, 0, oversized, 0, prefix.length);
    HttpResponse<String> response =
        createAttendance(
            catId,
            loginAndGetToken(adminEmail),
            validData(),
            oversized,
            "large.pdf",
            "application/pdf");
    assertThat(response.statusCode()).isBetween(400, 499);
  }

  @Test
  void invalidFileSignatureIsRejectedEvenWhenClientClaimsPdf() throws Exception {
    HttpResponse<String> response =
        createAttendance(
            catId,
            loginAndGetToken(adminEmail),
            validData(),
            "not a PDF".getBytes(StandardCharsets.US_ASCII),
            "fake.pdf",
            "application/pdf");
    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void futureAttendanceDateIsRejected() throws Exception {
    Map<String, Object> data = validData();
    data.put("attendanceDate", LocalDate.now().plusDays(2).toString());
    HttpResponse<String> response =
        createAttendance(
            catId,
            loginAndGetToken(adminEmail),
            data,
            PDF.getBytes(StandardCharsets.US_ASCII),
            "report.pdf",
            "application/pdf");
    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void listingIsIsolatedByCatId() throws Exception {
    String token = loginAndGetToken(adminEmail);
    HttpResponse<String> create =
        createAttendance(
            catId,
            token,
            validData(),
            PDF.getBytes(StandardCharsets.US_ASCII),
            "report.pdf",
            "application/pdf");
    assertThat(create.statusCode()).isEqualTo(201);
    Cat anotherCat =
        seedCat(
            "Outro gato " + UUID.randomUUID(),
            roomRepository.findById(roomId).orElseThrow(),
            userRepository.findById(adminUserId).orElseThrow());
    try {
      HttpResponse<String> otherList =
          get("/cats/" + anotherCat.getId() + "/external-attendances", token);
      assertThat(otherList.statusCode()).isEqualTo(200);
      assertThat(otherList.body()).doesNotContain("Consulta de rotina");
    } finally {
      catRepository.deleteById(anotherCat.getId());
    }
  }

  private User seedReadyUser(String name, AccessType accessType) {
    return userRepository.save(
        new User(name, null, null, accessType, null, null, LocalDateTime.now(ZoneOffset.UTC)));
  }

  private Integer seedAuth(Integer userId, String email) {
    UserAuth auth =
        new UserAuth(
            userRepository.findById(userId).orElseThrow(), email, passwordEncoder.encode(PASSWORD));
    return userAuthRepository.save(auth).getId();
  }

  private Cat seedCat(String name, Room room, User creator) {
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
            creator));
  }

  private Map<String, Object> validData() {
    return new java.util.LinkedHashMap<>(
        Map.of(
            "partnerClinic",
            "Clínica Parceira",
            "veterinarian",
            "Dra. Ana",
            "crmv",
            "CRMV-MG 12345",
            "attendanceDate",
            LocalDate.now().toString(),
            "diagnosis",
            "Consulta de rotina"));
  }

  private HttpResponse<String> createAttendance(
      Integer targetCatId,
      String token,
      Map<String, Object> data,
      byte[] file,
      String filename,
      String clientType)
      throws Exception {
    String boundary = "AmicatsBoundary" + UUID.randomUUID().toString().replace("-", "");
    byte[] prefix =
        ("--"
                + boundary
                + "\r\nContent-Disposition: form-data; name=\"data\"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"
                + objectMapper.writeValueAsString(data)
                + "\r\n--"
                + boundary
                + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\""
                + filename
                + "\"\r\nContent-Type: "
                + clientType
                + "\r\n\r\n")
            .getBytes(StandardCharsets.UTF_8);
    byte[] suffix = ("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8);
    byte[] body = new byte[prefix.length + file.length + suffix.length];
    System.arraycopy(prefix, 0, body, 0, prefix.length);
    System.arraycopy(file, 0, body, prefix.length, file.length);
    System.arraycopy(suffix, 0, body, prefix.length + file.length, suffix.length);
    HttpRequest request =
        HttpRequest.newBuilder()
            .uri(URI.create(baseUrl() + "/cats/" + targetCatId + "/external-attendances"))
            .header("Authorization", "Bearer " + token)
            .header("Content-Type", "multipart/form-data; boundary=" + boundary)
            .POST(HttpRequest.BodyPublishers.ofByteArray(body))
            .build();
    return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
  }

  private String loginAndGetToken(String email) throws Exception {
    HttpRequest request =
        HttpRequest.newBuilder()
            .uri(URI.create(baseUrl() + "/auth/login"))
            .header("Content-Type", "application/json")
            .POST(
                HttpRequest.BodyPublishers.ofString(
                    objectMapper.writeValueAsString(Map.of("email", email, "password", PASSWORD))))
            .build();
    return (String)
        parse(httpClient.send(request, HttpResponse.BodyHandlers.ofString())).get("token");
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

  private HttpResponse<byte[]> getBytes(String path, String token) throws Exception {
    HttpRequest request =
        HttpRequest.newBuilder()
            .uri(URI.create(baseUrl() + path))
            .header("Authorization", "Bearer " + token)
            .GET()
            .build();
    return httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> parse(HttpResponse<String> response) throws Exception {
    return objectMapper.readValue(response.body(), Map.class);
  }

  private String baseUrl() {
    return "http://localhost:" + port;
  }
}
