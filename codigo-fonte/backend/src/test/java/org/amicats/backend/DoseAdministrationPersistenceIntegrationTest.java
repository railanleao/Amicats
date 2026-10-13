package org.amicats.backend;

import static org.assertj.core.api.Assertions.*;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import org.amicats.backend.application.factory.doseadministration.RegisterDoseAdministrationFactory;
import org.amicats.backend.domain.entity.*;
import org.amicats.backend.domain.enums.*;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockConsumptionDataProvider;
import org.amicats.backend.domain.policy.DoseAdministrationTimePolicy;
import org.amicats.backend.domain.usecase.doseadministration.register.*;
import org.amicats.backend.repository.cat.CatRepository;
import org.amicats.backend.repository.doseadministration.DoseAdministrationRepository;
import org.amicats.backend.repository.internalmedicalprescription.InternalMedicalPrescriptionRepository;
import org.amicats.backend.repository.prescribedmedication.PrescribedMedicationRepository;
import org.amicats.backend.repository.stock.StockConsumptionRepository;
import org.amicats.backend.repository.stock.StockItemRepository;
import org.amicats.backend.repository.user.UserRepository;
import org.amicats.backend.service.storage.MinioPhotoStorage;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
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
  @Autowired private StockConsumptionRepository consumptions;
  @MockitoSpyBean private StockConsumptionDataProvider consumptionProvider;
  @Autowired private InternalMedicalPrescriptionRepository prescriptions;
  @Autowired private PrescribedMedicationRepository medications;
  @Autowired private PlatformTransactionManager transactionManager;
  @Autowired private JdbcTemplate jdbc;
  @MockitoBean private MinioPhotoStorage photoStorage;

  private Integer userId;
  private Integer catId;
  private Integer stockId;
  private Integer prescriptionId;
  private Integer medicationId;
  private Integer secondMedicationId;
  private final UUID secondOperation = UUID.randomUUID();
  private final UUID operation = UUID.randomUUID();
  private LocalDateTime applied;

  @BeforeEach
  void setUp() {
    new TransactionTemplate(transactionManager)
        .executeWithoutResult(
            status -> {
              LocalDateTime created = LocalDateTime.now(Clock.systemUTC()).minusDays(1);
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
                          DoseAdministrationTimePolicy.clinicalDate(
                              created, ZoneId.of("America/Sao_Paulo")),
                          created));
              medicationId = medication.getId();
              applied = LocalDateTime.now(Clock.systemUTC()).minusMinutes(1);
            });
  }

  @AfterEach
  void cleanUp() {
    new TransactionTemplate(transactionManager)
        .executeWithoutResult(
            status -> {
              for (UUID key : List.of(operation, secondOperation)) {
                doses
                    .findByClientOperationId(key)
                    .ifPresent(
                        dose -> {
                          consumptions.deleteByDose_Id(dose.getId());
                          consumptions.flush();
                          doses.delete(dose);
                        });
              }
              if (secondMedicationId != null) medications.deleteById(secondMedicationId);
              if (medicationId != null) medications.deleteById(medicationId);
              if (prescriptionId != null) prescriptions.deleteById(prescriptionId);
              if (stockId != null) stocks.deleteById(stockId);
              if (catId != null) cats.deleteById(catId);
              if (userId != null) users.deleteById(userId);
            });
  }

  @Test
  void databaseAllowsSmallClockDriftButRejectsMoreThanFiveMinutes() {
    LocalDateTime slightlyAhead = LocalDateTime.now(Clock.systemUTC()).plusMinutes(2);
    var result =
        factory
            .create()
            .execute(
                medicationId,
                userId,
                new RegisterDoseAdministrationInput(
                    operation,
                    slightlyAhead,
                    null,
                    DoseRegistrationOrigin.OfflineSynced,
                    BigDecimal.ONE,
                    "unidade"));
    assertThat(result.created()).isTrue();
    assertThat(result.dose().administeredAt()).isAfter(result.dose().recordedAt());
    assertThat(doses.findByClientOperationId(operation)).isPresent();
    assertThatThrownBy(
            () ->
                jdbc.update(
                    "UPDATE dose_administrations SET administered_at = recorded_at + INTERVAL '5 minutes 0.000001 seconds' "
                        + "WHERE id_dose_administration = ?",
                    result.dose().id()))
        .isInstanceOf(DataIntegrityViolationException.class);
  }

  @Test
  void movementFailureRollsBackTheDoseAndTheStockBalance() {
    Mockito.doThrow(new IllegalStateException("Movement failure"))
        .when(consumptionProvider)
        .save(ArgumentMatchers.any());
    try {
      assertThatThrownBy(
              () ->
                  factory
                      .create()
                      .execute(
                          medicationId,
                          userId,
                          new RegisterDoseAdministrationInput(
                              operation,
                              applied,
                              null,
                              DoseRegistrationOrigin.Online,
                              BigDecimal.ONE,
                              "unidade")))
          .isInstanceOf(IllegalStateException.class);
      assertThat(doses.findByClientOperationId(operation)).isEmpty();
      assertThat(stocks.findById(stockId).orElseThrow().getQuantity()).isEqualByComparingTo("1");
    } finally {
      Mockito.reset(consumptionProvider);
    }
  }

  @Test
  void differentPrescriptionsSharingStockDoNotLoseConcurrentDebits() throws Exception {
    new TransactionTemplate(transactionManager)
        .executeWithoutResult(
            status -> {
              var original = medications.findById(medicationId).orElseThrow();
              secondMedicationId =
                  medications
                      .save(
                          PrescribedMedication.fromInternal(
                              prescriptions.findById(prescriptionId).orElseThrow(),
                              stocks.findById(stockId).orElseThrow(),
                              "Outra dose",
                              AdministrationRoute.Oral,
                              12,
                              7,
                              original.getStartDate(),
                              original.getCreatedAt()))
                      .getId();
            });
    // Read a database timestamp before the debits to verify the incremental sync query.
    jdbc.update("update stock_items set name = name where id_stock_item = ?", stockId);
    var before = stocks.findById(stockId).orElseThrow().getUpdatedAt();
    var pool = Executors.newFixedThreadPool(2);
    var ready = new CountDownLatch(2);
    var start = new CountDownLatch(1);
    try {
      List<Future<RegisterDoseAdministrationResult>> futures = new ArrayList<>();
      for (int i = 0; i < 2; i++) {
        final int index = i;
        futures.add(
            pool.submit(
                () -> {
                  ready.countDown();
                  if (!start.await(10, TimeUnit.SECONDS))
                    throw new IllegalStateException("Start timed out");
                  return factory
                      .create()
                      .execute(
                          index == 0 ? medicationId : secondMedicationId,
                          userId,
                          new RegisterDoseAdministrationInput(
                              index == 0 ? operation : secondOperation,
                              applied,
                              null,
                              DoseRegistrationOrigin.OfflineSynced,
                              new BigDecimal("0.75"),
                              "unidade"));
                }));
      }
      assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
      start.countDown();
      for (var future : futures) {
        var result = future.get(30, TimeUnit.SECONDS);
        assertThat(result.created()).isTrue();
        assertThat(consumptions.countByDose_Id(result.dose().id())).isEqualTo(1);
      }
      var stock = stocks.findById(stockId).orElseThrow();
      assertThat(stock.getQuantity()).isEqualByComparingTo("-0.5");
      assertThat(stock.getUpdatedAt()).isAfterOrEqualTo(before);
      assertThat(stocks.findUpdatedSince(before)).extracting(StockItem::getId).contains(stockId);
      var alerts = stocks.findMedicationAlerts(PageRequest.of(0, 100));
      assertThat(alerts.getContent()).extracting(StockItem::getId).contains(stockId);
    } finally {
      start.countDown();
      pool.shutdownNow();
      pool.awaitTermination(35, TimeUnit.SECONDS);
    }
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
                              operation,
                              applied,
                              null,
                              DoseRegistrationOrigin.OfflineSynced,
                              BigDecimal.ONE,
                              "unidade"));
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
      var saved = doses.findByClientOperationId(operation).orElseThrow();
      assertThat(consumptions.countByDose_Id(saved.getId())).isEqualTo(1);
      assertThat(stocks.findById(stockId).orElseThrow().getQuantity()).isEqualByComparingTo("0");
    } finally {
      start.countDown();
      pool.shutdownNow();
      pool.awaitTermination(35, TimeUnit.SECONDS);
    }
  }
}
