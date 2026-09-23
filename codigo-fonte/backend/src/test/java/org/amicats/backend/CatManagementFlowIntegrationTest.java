package org.amicats.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.Room;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.entity.UserAuth;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.enums.GeneralStatus;
import org.amicats.backend.domain.enums.Sex;
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
 * Boots the whole Spring context on a real HTTP server to prove the /cats endpoints (list, read and
 * photo management) are actually reachable as the frontend expects — unit tests of the use cases
 * alone don't exercise SecurityConfig, JSON serialization, routing or the JPQL search query.
 * Listing and reading are open to any authenticated user; photo upload and removal remain
 * Administrator-only.
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

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient httpClient = HttpClient.newHttpClient();

  private User adminUser;
  private Integer adminAuthId;
  private Integer assistantUserId;
  private Integer assistantAuthId;
  private Integer targetRoomId;
  private Integer targetCatId;

  private String adminEmail;
  private String assistantEmail;
  private String targetRoomTitleToken;
  private String targetCatNameToken;

  @BeforeEach
  void setUp() {
    adminEmail = "admin-" + UUID.randomUUID() + "@amicats.org.br";
    assistantEmail = "assistant-" + UUID.randomUUID() + "@amicats.org.br";
    targetRoomTitleToken = "Sala" + UUID.randomUUID().toString().replace("-", "");
    targetCatNameToken = "Gato" + UUID.randomUUID().toString().replace("-", "");

    adminUser = seedReadyUser("Admin de Teste", AccessType.Administrator);
    adminAuthId = seedAuth(adminUser.getId(), adminEmail);

    User assistant = seedReadyUser("Assistente de Teste", AccessType.Assistant);
    assistantUserId = assistant.getId();
    assistantAuthId = seedAuth(assistantUserId, assistantEmail);

    Room targetRoom =
        roomRepository.save(new Room(targetRoomTitleToken, "Descrição de teste", null, 4));
    targetRoomId = targetRoom.getId();

    targetCatId = seedCat(targetCatNameToken, targetRoom, GeneralStatus.UnderTreatment).getId();
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

  private Cat seedCat(String name, Room room, GeneralStatus status) {
    return catRepository.save(
        new Cat(
            name,
            room,
            Sex.Female,
            LocalDate.now().minusYears(2),
            "Rajada",
            new BigDecimal("3.50"),
            null,
            status,
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
    catRepository.deleteById(targetCatId);
    roomRepository.deleteById(targetRoomId);
    userAuthRepository.deleteById(assistantAuthId);
    userRepository.deleteById(assistantUserId);
    userAuthRepository.deleteById(adminAuthId);
    userRepository.deleteById(adminUser.getId());
  }

  @Test
  void anAdministratorCanListAndGetACat() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> listResponse = get("/cats?search=" + targetCatNameToken, adminToken);
    assertThat(listResponse.statusCode()).isEqualTo(200);
    List<Map<String, Object>> cats = contentOf(parse(listResponse));
    assertThat(cats)
        .anySatisfy(
            cat -> {
              assertThat(cat.get("id")).isEqualTo(targetCatId);
              assertThat(cat.get("roomTitle")).isEqualTo(targetRoomTitleToken);
              assertThat(cat.get("generalStatus")).isEqualTo("UnderTreatment");
            });

    Map<String, Object> byId = parse(get("/cats/" + targetCatId, adminToken));
    assertThat(byId.get("id")).isEqualTo(targetCatId);
    assertThat(byId.get("photoUrl")).isNull();
  }

  @Test
  void aNonAdministratorCanListCats() throws Exception {
    String assistantToken = loginAndGetToken(assistantEmail);

    HttpResponse<String> response = get("/cats?search=" + targetCatNameToken, assistantToken);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(contentOf(parse(response)))
        .anySatisfy(cat -> assertThat(cat.get("id")).isEqualTo(targetCatId));
  }

  @Test
  void aNonAdministratorCanGetCatById() throws Exception {
    String assistantToken = loginAndGetToken(assistantEmail);

    HttpResponse<String> response = get("/cats/" + targetCatId, assistantToken);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(parse(response).get("id")).isEqualTo(targetCatId);
  }

  @Test
  void gettingAnUnknownCatReturnsNotFound() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response = get("/cats/999999999", adminToken);

    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  void filtersByRoomId() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    Room otherRoom = roomRepository.save(new Room("Sala" + UUID.randomUUID(), null, null, null));
    Cat catInOtherRoom =
        seedCat("Gato" + UUID.randomUUID(), otherRoom, GeneralStatus.UnderTreatment);

    try {
      List<Map<String, Object>> filtered =
          contentOf(parse(get("/cats?roomId=" + targetRoomId, adminToken)));

      assertThat(filtered).extracting(cat -> cat.get("id")).contains(targetCatId);
      assertThat(filtered).extracting(cat -> cat.get("id")).doesNotContain(catInOtherRoom.getId());
    } finally {
      catRepository.deleteById(catInOtherRoom.getId());
      roomRepository.deleteById(otherRoom.getId());
    }
  }

  @Test
  void filtersByGeneralStatus() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    Cat adoptedCat = seedCat("Gato" + UUID.randomUUID(), null, GeneralStatus.Adopted);

    try {
      List<Map<String, Object>> adoptedOnly =
          contentOf(parse(get("/cats?generalStatus=Adopted", adminToken)));
      assertThat(adoptedOnly).extracting(cat -> cat.get("id")).contains(adoptedCat.getId());
      assertThat(adoptedOnly).extracting(cat -> cat.get("id")).doesNotContain(targetCatId);

      List<Map<String, Object>> underTreatmentOnly =
          contentOf(parse(get("/cats?generalStatus=UnderTreatment", adminToken)));
      assertThat(underTreatmentOnly).extracting(cat -> cat.get("id")).contains(targetCatId);
      assertThat(underTreatmentOnly)
          .extracting(cat -> cat.get("id"))
          .doesNotContain(adoptedCat.getId());
    } finally {
      catRepository.deleteById(adoptedCat.getId());
    }
  }

  @Test
  void paginatesResultsAcrossPages() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    String pageToken = "Pag" + UUID.randomUUID().toString().replace("-", "");

    Cat first = seedCat(pageToken + "A", null, GeneralStatus.UnderTreatment);
    Cat second = seedCat(pageToken + "B", null, GeneralStatus.UnderTreatment);

    try {
      Map<String, Object> firstPage =
          parse(get("/cats?search=" + pageToken + "&page=0&size=1", adminToken));
      assertThat(contentOf(firstPage)).hasSize(1);
      assertThat(firstPage.get("totalElements")).isEqualTo(2);
      assertThat(firstPage.get("totalPages")).isEqualTo(2);

      Map<String, Object> secondPage =
          parse(get("/cats?search=" + pageToken + "&page=1&size=1", adminToken));
      assertThat(contentOf(secondPage)).hasSize(1);

      Object firstPageCatId = contentOf(firstPage).get(0).get("id");
      Object secondPageCatId = contentOf(secondPage).get(0).get("id");
      assertThat(List.of(firstPageCatId, secondPageCatId))
          .containsExactlyInAnyOrder(first.getId(), second.getId());
    } finally {
      catRepository.deleteById(first.getId());
      catRepository.deleteById(second.getId());
    }
  }

  @Test
  void anAdministratorCanUploadReadAndRemoveACatPhoto() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> uploadResponse =
        uploadPhoto(targetCatId, adminToken, png(300, 200), "photo.png", "image/png");
    assertThat(uploadResponse.statusCode()).isEqualTo(200);
    assertThat(parse(uploadResponse).get("photoUrl")).isEqualTo("/cats/" + targetCatId + "/photo");

    HttpResponse<byte[]> readResponse = getPhoto(targetCatId, adminToken);
    assertThat(readResponse.statusCode()).isEqualTo(200);
    assertThat(readResponse.headers().firstValue("Content-Type")).contains("image/jpeg");
    assertThat(ImageIO.read(new ByteArrayInputStream(readResponse.body()))).isNotNull();

    HttpResponse<String> removeResponse =
        send("DELETE", "/cats/" + targetCatId + "/photo", adminToken, null);
    assertThat(removeResponse.statusCode()).isEqualTo(204);

    assertThat(parse(get("/cats/" + targetCatId, adminToken)).get("photoUrl")).isNull();
    assertThat(getPhoto(targetCatId, adminToken).statusCode()).isEqualTo(404);
  }

  @Test
  void uploadingAnInvalidPhotoReturnsBadRequest() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response =
        uploadPhoto(
            targetCatId,
            adminToken,
            "não é uma imagem".getBytes(StandardCharsets.UTF_8),
            "nota.txt",
            "text/plain");

    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  void uploadingAPhotoForAnUnknownCatReturnsNotFound() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);

    HttpResponse<String> response =
        uploadPhoto(999999999, adminToken, png(100, 100), "photo.png", "image/png");

    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  void listsACatWithoutARoomWithoutBreaking() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    Cat catWithoutRoom = seedCat("Gato" + UUID.randomUUID(), null, GeneralStatus.UnderTreatment);

    try {
      HttpResponse<String> response = get("/cats?search=" + catWithoutRoom.getName(), adminToken);

      assertThat(response.statusCode()).isEqualTo(200);
      Map<String, Object> cat = contentOf(parse(response)).get(0);
      assertThat(cat.get("id")).isEqualTo(catWithoutRoom.getId());
      assertThat(cat.get("roomId")).isNull();
      assertThat(cat.get("roomTitle")).isNull();
    } finally {
      catRepository.deleteById(catWithoutRoom.getId());
    }
  }

  @Test
  void aNonAdministratorCannotUploadOrRemoveAPhotoButCanReadIt() throws Exception {
    String adminToken = loginAndGetToken(adminEmail);
    String assistantToken = loginAndGetToken(assistantEmail);
    assertThat(
            uploadPhoto(targetCatId, adminToken, png(100, 100), "photo.png", "image/png")
                .statusCode())
        .isEqualTo(200);

    assertThat(
            uploadPhoto(targetCatId, assistantToken, png(100, 100), "photo.png", "image/png")
                .statusCode())
        .isEqualTo(403);
    assertThat(send("DELETE", "/cats/" + targetCatId + "/photo", assistantToken, null).statusCode())
        .isEqualTo(403);
    assertThat(getPhoto(targetCatId, assistantToken).statusCode()).isEqualTo(200);
  }

  private byte[] png(int width, int height) throws Exception {
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    ImageIO.write(new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB), "png", out);
    return out.toByteArray();
  }

  private HttpResponse<String> uploadPhoto(
      Integer catId, String token, byte[] fileContent, String filename, String contentType)
      throws Exception {
    String boundary = "AmicatsBoundary" + UUID.randomUUID();
    ByteArrayOutputStream body = new ByteArrayOutputStream();
    body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
    body.write(
        ("Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"\r\n")
            .getBytes(StandardCharsets.UTF_8));
    body.write(("Content-Type: " + contentType + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
    body.write(fileContent);
    body.write(("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));

    HttpRequest request =
        HttpRequest.newBuilder()
            .uri(URI.create(baseUrl() + "/cats/" + catId + "/photo"))
            .header("Authorization", "Bearer " + token)
            .header("Content-Type", "multipart/form-data; boundary=" + boundary)
            .PUT(BodyPublishers.ofByteArray(body.toByteArray()))
            .build();
    return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
  }

  private HttpResponse<byte[]> getPhoto(Integer catId, String token) throws Exception {
    HttpRequest request =
        HttpRequest.newBuilder()
            .uri(URI.create(baseUrl() + "/cats/" + catId + "/photo"))
            .header("Authorization", "Bearer " + token)
            .GET()
            .build();
    return httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
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
  private List<Map<String, Object>> contentOf(Map<String, Object> page) {
    return (List<Map<String, Object>>) page.get("content");
  }
}
