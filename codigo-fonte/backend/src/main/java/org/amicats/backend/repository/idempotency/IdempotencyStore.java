package org.amicats.backend.repository.idempotency;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class IdempotencyStore {

  public static final int PROCESSING = 0;

  private static final String CLAIM_SQL =
      """
      INSERT INTO idempotency_keys (id_user, idempotency_key, method, path, response_status)
      VALUES (?, ?, ?, ?, 0)
      ON CONFLICT (id_user, idempotency_key) DO UPDATE
        SET method = EXCLUDED.method, path = EXCLUDED.path, created_at = now()
        WHERE idempotency_keys.response_status = 0
          AND idempotency_keys.created_at < now() - interval '5 minutes'
      """;

  private final JdbcTemplate jdbcTemplate;

  public boolean claim(Integer userId, String key, String method, String path) {
    return jdbcTemplate.update(CLAIM_SQL, userId, key, method, path) == 1;
  }

  public Optional<StoredResponse> find(Integer userId, String key) {
    return jdbcTemplate
        .query(
            "SELECT method, path, response_status, response_content_type, response_body "
                + "FROM idempotency_keys WHERE id_user = ? AND idempotency_key = ?",
            (rs, rowNum) ->
                new StoredResponse(
                    rs.getString("method"),
                    rs.getString("path"),
                    rs.getInt("response_status"),
                    rs.getString("response_content_type"),
                    rs.getString("response_body")),
            userId,
            key)
        .stream()
        .findFirst();
  }

  public void complete(
      Integer userId, String key, int status, String contentType, String responseBody) {
    jdbcTemplate.update(
        "UPDATE idempotency_keys SET response_status = ?, response_content_type = ?, "
            + "response_body = ? WHERE id_user = ? AND idempotency_key = ?",
        status,
        contentType,
        responseBody,
        userId,
        key);
  }

  public void release(Integer userId, String key) {
    jdbcTemplate.update(
        "DELETE FROM idempotency_keys WHERE id_user = ? AND idempotency_key = ?", userId, key);
  }

  public int deleteOlderThanDays(int days) {
    return jdbcTemplate.update(
        "DELETE FROM idempotency_keys WHERE created_at < now() - make_interval(days => ?)", days);
  }

  public record StoredResponse(
      String method, String path, int status, String contentType, String body) {

    public boolean isProcessing() {
      return status == PROCESSING;
    }
  }
}
