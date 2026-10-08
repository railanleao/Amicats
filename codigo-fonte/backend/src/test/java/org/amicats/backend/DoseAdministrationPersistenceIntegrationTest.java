package org.amicats.backend;

import static org.assertj.core.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import org.amicats.backend.application.factory.doseadministration.RegisterDoseAdministrationFactory;
import org.amicats.backend.domain.entity.*;
import org.amicats.backend.domain.enums.*;
import org.amicats.backend.domain.usecase.doseadministration.register.*;
import org.amicats.backend.repository.cat.CatRepository;
import org.amicats.backend.repository.doseadministration.DoseAdministrationRepository;
import org.amicats.backend.repository.internalmedicalprescription.InternalMedicalPrescriptionRepository;
import org.amicats.backend.repository.prescribedmedication.PrescribedMedicationRepository;
import org.amicats.backend.repository.stock.StockItemRepository;
import org.amicats.backend.repository.user.UserRepository;
import org.amicats.backend.service.storage.MinioPhotoStorage;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** Run only against a disposable PostgreSQL database; migrations are applied on startup. */
@SpringBootTest(
    properties = {
      "jwt.secret=dose-integration-test-secret-at-least-thirty-two-bytes",
      "app.clinical-time-zone=America/Sao_Paulo"
    })
@EnabledIfEnvironmentVariable(named = "RUN_DOSE_POSTGRES_TESTS", matches = "true")
class DoseAdministrationPersistenceIntegrationTest {
  @Autowired private RegisterDoseAdministrationFactory factory;
  @Autowired private DoseAdministrationRepository doses;
  @Autowired private UserRepository users;
  @Autowired private CatRepository cats;
  @Autowired private StockItemRepository stocks;
  @Autowired private InternalMedicalPrescriptionRepository prescriptions;
  @Autowired private PrescribedMedicationRepository medications;
  @Autowired private PlatformTransactionManager transactionManager;
  @Autowired private org.springframework.jdbc.core.JdbcTemplate jdbc;
  @MockitoBean private MinioPhotoStorage photoStorage;

  private Integer userId;
  private Integer catId;
  private Integer stockId;
  private Integer prescriptionId;
  private Integer medicationId;
  private final UUID operation = UUID.randomUUID();
  private LocalDateTime applied;

  @BeforeEach
  void setUp() {
    new TransactionTemplate(transactionManager)
        .executeWithoutResult(
            status -> {
              LocalDateTime created = LocalDateTime.now(java.time.Clock.systemUTC()).minusDays(1);
              User user =
                  users.save(
                      new User(
                          "Dose test",
                          null,
                          null,
                          AccessType.Veterinarian,
                          "12345",
                          "MS",
                          created));
              userId = user.getId();
              Cat cat =
                  cats.save(
                      new Cat(
                          "Dose test",
                          null,
                          null,
                          null,
                          null,
                          null,
                          null,
                          GeneralStatus.UnderTreatment,
                          null,
                          null,
                          null,
                          null,
                          null,
                          null,
                          user));
              catId = cat.getId();
              StockItem stock =
                  stocks.save(
                      new StockItem("Dose test", "Medicamento", BigDecimal.ONE, "unidade", null));
              stockId = stock.getId();
              InternalMedicalPrescription prescription =
                  prescriptions.save(
                      new InternalMedicalPrescription(cat, user, "Dose test", null, true, created));
              prescriptionId = prescription.getId();
              PrescribedMedication medication =
                  medications.save(
                      PrescribedMedication.fromInternal(
                          prescription,
                          stock,
                          "dose de teste",
                          AdministrationRoute.Oral,
                          12,
                          7,
                          created
                              .atOffset(java.time.ZoneOffset.UTC)
                              .atZoneSameInstant(java.time.ZoneId.of("America/Sao_Paulo"))
                              .toLocalDate(),
                          created));
              medicationId = medication.getId();
              applied = LocalDateTime.now(java.time.Clock.systemUTC()).minusMinutes(1);
            });
  }

  @AfterEach
  void cleanUp() {
    new TransactionTemplate(transactionManager)
        .executeWithoutResult(
            status -> {
              doses.findByClientOperationId(operation).ifPresent(doses::delete);
              if (medicationId != null) medications.deleteById(medicationId);
              if (prescriptionId != null) prescriptions.deleteById(prescriptionId);
              if (stockId != null) stocks.deleteById(stockId);
              if (catId != null) cats.deleteById(catId);
              if (userId != null) users.deleteById(userId);
            });
  }

  @Test
  void databaseAllowsSmallClockDriftButRejectsMoreThanFiveMinutes() {
    LocalDateTime slightlyAhead = LocalDateTime.now(java.time.Clock.systemUTC()).plusMinutes(2);
    var result =
        factory
            .create()
            .execute(
                medicationId,
                userId,
                new RegisterDoseAdministrationInput(
                    operation, slightlyAhead, null, DoseRegistrationOrigin.OfflineSynced));
    assertThat(result.created()).isTrue();
    assertThat(result.dose().administeredAt()).isAfter(result.dose().recordedAt());
    assertThat(doses.findByClientOperationId(operation)).isPresent();
    assertThatThrownBy(
            () ->
                jdbc.update(
                    "UPDATE dose_administrations SET administered_at = recorded_at + INTERVAL '5 minutes 0.000001 seconds' "
                        + "WHERE id_dose_administration = ?",
                    result.dose().id()))
        .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
  }

  @Test
  void simultaneousReplaysCreateExactlyOneRowWithTheSameId() throws Exception {
    ExecutorService pool = Executors.newFixedThreadPool(4);
    CountDownLatch ready = new CountDownLatch(4);
    CountDownLatch start = new CountDownLatch(1);
    List<Future<RegisterDoseAdministrationResult>> futures = new ArrayList<>();
    try {
      for (int i = 0; i < 4; i++) {
        futures.add(
            pool.submit(
                () -> {
                  ready.countDown();
                  if (!start.await(10, TimeUnit.SECONDS))
                    throw new IllegalStateException("Start timed out");
                  return factory
                      .create()
                      .execute(
                          medicationId,
                          userId,
                          new RegisterDoseAdministrationInput(
                              operation, applied, null, DoseRegistrationOrigin.OfflineSynced));
                }));
      }
      assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
      start.countDown();
      List<RegisterDoseAdministrationResult> results = new ArrayList<>();
      for (var future : futures) results.add(future.get(30, TimeUnit.SECONDS));
      assertThat(results.stream().filter(RegisterDoseAdministrationResult::created).count())
          .isEqualTo(1);
      assertThat(results.stream().map(result -> result.dose().id()).distinct().count())
          .isEqualTo(1);
      assertThat(doses.findByClientOperationId(operation)).isPresent();
    } finally {
      start.countDown();
      pool.shutdownNow();
      pool.awaitTermination(35, TimeUnit.SECONDS);
    }
  }
}
