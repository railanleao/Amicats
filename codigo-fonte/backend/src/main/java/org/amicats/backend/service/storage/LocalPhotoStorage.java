package org.amicats.backend.service.storage;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class LocalPhotoStorage implements PhotoStorage {

  private final Path baseDir;

  public LocalPhotoStorage(@Value("${app.storage.photos-dir:./data/photos}") String photosDir) {
    this.baseDir = Path.of(photosDir).toAbsolutePath().normalize();
  }

  @Override
  public void save(String key, byte[] content) {
    Path target = resolve(key);
    try {
      Files.createDirectories(target.getParent());
      Path temp = Files.createTempFile(target.getParent(), "upload-", ".tmp");
      Files.write(temp, content);
      Files.move(temp, target, StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException e) {
      throw new UncheckedIOException("Falha ao gravar a foto.", e);
    }
  }

  @Override
  public Optional<byte[]> load(String key) {
    Path target = resolve(key);
    try {
      return Files.isRegularFile(target)
          ? Optional.of(Files.readAllBytes(target))
          : Optional.empty();
    } catch (IOException e) {
      throw new UncheckedIOException("Falha ao ler a foto.", e);
    }
  }

  @Override
  public void delete(String key) {
    try {
      Files.deleteIfExists(resolve(key));
    } catch (IOException e) {
      throw new UncheckedIOException("Falha ao remover a foto.", e);
    }
  }

  private Path resolve(String key) {
    Path resolved = baseDir.resolve(key).normalize();
    if (!resolved.startsWith(baseDir)) {
      throw new IllegalArgumentException("Chave de arquivo inválida.");
    }
    return resolved;
  }
}
