package org.amicats.backend.service.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LocalPhotoStorageTest {

  @TempDir Path tempDir;

  private LocalPhotoStorage storage;

  @BeforeEach
  void setUp() {
    storage = new LocalPhotoStorage(tempDir.toString());
  }

  @Test
  void savesReplacesAndLoadsTheSameBytes() {
    storage.save("users/1/avatar.jpg", new byte[] {1, 2, 3});
    assertThat(storage.load("users/1/avatar.jpg")).contains(new byte[] {1, 2, 3});

    storage.save("users/1/avatar.jpg", new byte[] {9, 9});
    assertThat(storage.load("users/1/avatar.jpg")).contains(new byte[] {9, 9});
  }

  @Test
  void loadReturnsEmptyAndDeleteCanBeRepeated() {
    assertThat(storage.load("users/404/avatar.jpg")).isEmpty();

    storage.save("users/1/avatar.jpg", new byte[] {1});
    storage.delete("users/1/avatar.jpg");
    storage.delete("users/1/avatar.jpg");

    assertThat(storage.load("users/1/avatar.jpg")).isEmpty();
  }

  @Test
  void rejectsKeysThatEscapeTheBaseDirectory() {
    assertThatThrownBy(() -> storage.save("../evil.jpg", new byte[] {1}))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> storage.load("../../etc/passwd"))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> storage.delete("../evil.jpg"))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
