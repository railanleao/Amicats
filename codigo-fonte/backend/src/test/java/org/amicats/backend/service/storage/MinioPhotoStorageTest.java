package org.amicats.backend.service.storage;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MinioPhotoStorageTest {

  private MinioPhotoStorage storage;
  private String key;

  @BeforeEach
  void setUp() {
    String endpoint = System.getenv().getOrDefault("MINIO_ENDPOINT", "http://localhost:9010");
    String accessKey = System.getenv().getOrDefault("MINIO_ACCESS_KEY", "amicats");
    String secretKey = System.getenv().getOrDefault("MINIO_SECRET_KEY", "amicats123");
    String bucket = System.getenv().getOrDefault("MINIO_BUCKET", "amicats-photos");

    storage = new MinioPhotoStorage(endpoint, accessKey, secretKey, bucket);
    key = "tests/" + UUID.randomUUID() + "/cover.jpg";
  }

  @AfterEach
  void tearDown() {
    storage.delete(key);
  }

  @Test
  void savesReplacesAndLoadsTheSameBytes() {
    storage.save(key, new byte[] {1, 2, 3});
    assertThat(storage.load(key)).contains(new byte[] {1, 2, 3});

    storage.save(key, new byte[] {9, 9});
    assertThat(storage.load(key)).contains(new byte[] {9, 9});
  }

  @Test
  void loadReturnsEmptyAndDeleteCanBeRepeated() {
    assertThat(storage.load("tests/" + UUID.randomUUID() + "/missing.jpg")).isEmpty();

    storage.save(key, new byte[] {1});
    storage.delete(key);
    storage.delete(key);

    assertThat(storage.load(key)).isEmpty();
  }
}
