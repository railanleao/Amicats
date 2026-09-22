package org.amicats.backend.service.storage;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.errors.ErrorResponseException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Optional;
import org.amicats.backend.domain.interfaces.storage.PhotoStorage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MinioPhotoStorage implements PhotoStorage {

  private final MinioClient client;
  private final String bucket;

  public MinioPhotoStorage(
      @Value("${app.storage.minio.endpoint}") String endpoint,
      @Value("${app.storage.minio.access-key}") String accessKey,
      @Value("${app.storage.minio.secret-key}") String secretKey,
      @Value("${app.storage.minio.bucket}") String bucket) {
    this.client =
        MinioClient.builder().endpoint(endpoint).credentials(accessKey, secretKey).build();
    this.bucket = bucket;
    ensureBucketExists();
  }

  @Override
  public void save(String key, byte[] content) {
    try (InputStream input = new ByteArrayInputStream(content)) {
      client.putObject(
          PutObjectArgs.builder().bucket(bucket).object(key).stream(input, content.length, -1)
              .contentType("image/jpeg")
              .build());
    } catch (Exception e) {
      throw wrap("Falha ao gravar a foto.", e);
    }
  }

  @Override
  public Optional<byte[]> load(String key) {
    try (InputStream stream =
        client.getObject(GetObjectArgs.builder().bucket(bucket).object(key).build())) {
      return Optional.of(stream.readAllBytes());
    } catch (ErrorResponseException e) {
      if ("NoSuchKey".equals(e.errorResponse().code())) {
        return Optional.empty();
      }
      throw wrap("Falha ao ler a foto.", e);
    } catch (Exception e) {
      throw wrap("Falha ao ler a foto.", e);
    }
  }

  @Override
  public void delete(String key) {
    try {
      client.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(key).build());
    } catch (Exception e) {
      throw wrap("Falha ao remover a foto.", e);
    }
  }

  private void ensureBucketExists() {
    try {
      boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
      if (!exists) {
        client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
      }
    } catch (Exception e) {
      throw wrap("Falha ao preparar o bucket de fotos.", e);
    }
  }

  private static UncheckedIOException wrap(String message, Exception e) {
    return new UncheckedIOException(message, e instanceof IOException io ? io : new IOException(e));
  }
}
