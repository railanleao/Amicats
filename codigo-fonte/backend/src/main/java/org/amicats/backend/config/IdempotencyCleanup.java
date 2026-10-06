package org.amicats.backend.config;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.repository.idempotency.IdempotencyStore;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class IdempotencyCleanup {

  private static final int RETENTION_DAYS = 30;

  private final IdempotencyStore idempotencyStore;

  @Scheduled(fixedDelayString = "PT6H", initialDelayString = "PT10M")
  public void purgeExpiredKeys() {
    idempotencyStore.deleteOlderThanDays(RETENTION_DAYS);
  }
}
