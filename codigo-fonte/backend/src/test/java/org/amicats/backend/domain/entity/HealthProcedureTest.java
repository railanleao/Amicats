package org.amicats.backend.domain.entity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.amicats.backend.domain.enums.HealthProcedureAction;
import org.amicats.backend.domain.enums.HealthProcedureField;
import org.amicats.backend.domain.enums.HealthProcedureStatus;
import org.amicats.backend.domain.enums.HealthProcedureType;
import org.amicats.backend.domain.enums.NeuteringStatus;
import org.amicats.backend.exception.HealthProcedureConflictException;
import org.amicats.backend.exception.InvalidHealthProcedureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class HealthProcedureTest {

  private static final LocalDate TODAY = LocalDate.of(2026, 10, 9);
  private static final LocalDateTime NOW = LocalDateTime.of(2026, 10, 9, 15, 0);

  private Cat cat;
  private User user;

  @BeforeEach
  void setUp() {
    cat = mock(Cat.class);
    when(cat.getName()).thenReturn("Nina");
    user = mock(User.class);
  }

  @Test
  void schedulesAVaccineAndRecordsTheCreation() {
    HealthProcedure procedure = vaccine(TODAY.plusDays(3));

    assertThat(procedure.getStatus()).isEqualTo(HealthProcedureStatus.Scheduled);
    assertThat(procedure.getName()).isEqualTo("Antirrábica");
    assertThat(procedure.getChanges())
        .singleElement()
        .satisfies(
            change -> assertThat(change.getAction()).isEqualTo(HealthProcedureAction.Created));
  }

  @Test
  void requiresANameForVaccinesAndIgnoresItForNeutering() {
    assertThatThrownBy(
            () ->
                HealthProcedure.schedule(
                    cat, HealthProcedureType.Vaccine, "  ", TODAY, null, user, NOW, TODAY))
        .isInstanceOf(InvalidHealthProcedureException.class);

    HealthProcedure neutering =
        HealthProcedure.schedule(
            cat, HealthProcedureType.Neutering, "Qualquer", TODAY, null, user, NOW, TODAY);

    assertThat(neutering.getName()).isNull();
  }

  @Test
  void rejectsAScheduledDateInThePast() {
    assertThatThrownBy(() -> vaccine(TODAY.minusDays(1)))
        .isInstanceOf(InvalidHealthProcedureException.class);
  }

  @Test
  void recordsOneChangePerEditedField() {
    HealthProcedure procedure = vaccine(TODAY.plusDays(3));

    procedure.update("Antirrábica", TODAY.plusDays(5), "Levar carteira.", user, NOW, TODAY);

    assertThat(procedure.getChanges())
        .extracting(HealthProcedureChange::getField)
        .containsExactly(null, HealthProcedureField.ScheduledDate, HealthProcedureField.Notes);
    assertThat(procedure.getChanges().get(1).getOldValue()).isEqualTo("2026-10-12");
    assertThat(procedure.getChanges().get(1).getNewValue()).isEqualTo("2026-10-14");
  }

  @Test
  void recordsNothingWhenNothingChanged() {
    HealthProcedure procedure = vaccine(TODAY.plusDays(3));

    procedure.update(" Antirrábica ", TODAY.plusDays(3), "  ", user, NOW, TODAY);

    assertThat(procedure.getChanges()).hasSize(1);
  }

  @Test
  void keepsAnOverdueDateWhenOnlyOtherFieldsChange() {
    HealthProcedure procedure = vaccine(TODAY);

    procedure.update("V4", TODAY, null, user, NOW.plusDays(2), TODAY.plusDays(2));

    assertThat(procedure.getName()).isEqualTo("V4");
    assertThat(procedure.isOverdue(TODAY.plusDays(2))).isTrue();
  }

  @Test
  void completesAndRecordsTheDate() {
    HealthProcedure procedure = vaccine(TODAY);

    procedure.complete(TODAY, null, user, NOW, TODAY);

    assertThat(procedure.getStatus()).isEqualTo(HealthProcedureStatus.Completed);
    assertThat(procedure.getCompletedDate()).isEqualTo(TODAY);
    assertThat(procedure.getChanges().get(1).getAction())
        .isEqualTo(HealthProcedureAction.Completed);
  }

  @Test
  void rejectsACompletionDateInTheFuture() {
    HealthProcedure procedure = vaccine(TODAY);

    assertThatThrownBy(() -> procedure.complete(TODAY.plusDays(1), null, user, NOW, TODAY))
        .isInstanceOf(InvalidHealthProcedureException.class);
  }

  @Test
  void requiresAReasonToCancel() {
    HealthProcedure procedure = vaccine(TODAY);

    assertThatThrownBy(() -> procedure.cancel("  ", user, NOW))
        .isInstanceOf(InvalidHealthProcedureException.class);

    procedure.cancel(" Óbito ", user, NOW);

    assertThat(procedure.getStatus()).isEqualTo(HealthProcedureStatus.Cancelled);
    assertThat(procedure.getCancelReason()).isEqualTo("Óbito");
  }

  @Test
  void cannotBeChangedOnceCompletedOrCancelled() {
    HealthProcedure completed = vaccine(TODAY);
    completed.complete(TODAY, null, user, NOW, TODAY);
    HealthProcedure cancelled = vaccine(TODAY);
    cancelled.cancel("Óbito", user, NOW);

    for (HealthProcedure procedure : new HealthProcedure[] {completed, cancelled}) {
      assertThatThrownBy(() -> procedure.update("X", TODAY, null, user, NOW, TODAY))
          .isInstanceOf(InvalidHealthProcedureException.class);
      assertThatThrownBy(() -> procedure.complete(TODAY, null, user, NOW, TODAY))
          .isInstanceOf(InvalidHealthProcedureException.class);
      assertThatThrownBy(() -> procedure.cancel("X", user, NOW))
          .isInstanceOf(InvalidHealthProcedureException.class);
    }
  }

  @Test
  void schedulingANeuteringMarksTheCatAsScheduled() {
    HealthProcedure.schedule(
        cat, HealthProcedureType.Neutering, null, TODAY, null, user, NOW, TODAY);

    verify(cat).registerNeutering(NeuteringStatus.Scheduled, null);
  }

  @Test
  void rejectsANeuteringForACatAlreadyNeutered() {
    when(cat.getNeuteringStatus()).thenReturn(NeuteringStatus.Neutered);

    assertThatThrownBy(
            () ->
                HealthProcedure.schedule(
                    cat, HealthProcedureType.Neutering, null, TODAY, null, user, NOW, TODAY))
        .isInstanceOf(HealthProcedureConflictException.class);
  }

  @Test
  void completingANeuteringMarksTheCatAsNeutered() {
    HealthProcedure neutering = neutering();

    neutering.complete(TODAY, null, user, NOW, TODAY);

    verify(cat).registerNeutering(NeuteringStatus.Neutered, TODAY);
  }

  @Test
  void cancellingANeuteringRevertsTheCatOnlyWhileItIsStillScheduled() {
    HealthProcedure neutering = neutering();
    when(cat.getNeuteringStatus()).thenReturn(NeuteringStatus.Scheduled);

    neutering.cancel("Falta de verba", user, NOW);

    verify(cat).registerNeutering(NeuteringStatus.NotNeutered, null);
  }

  @Test
  void cancellingANeuteringKeepsTheCatWhenItsStatusWasChangedElsewhere() {
    HealthProcedure neutering = neutering();
    when(cat.getNeuteringStatus()).thenReturn(NeuteringStatus.Neutered);

    neutering.cancel("Castrado em outra clínica", user, NOW);

    verify(cat, never()).registerNeutering(NeuteringStatus.NotNeutered, null);
  }

  @Test
  void schedulesABoosterLinkedToTheCompletedVaccine() {
    HealthProcedure procedure = vaccine(TODAY);
    procedure.complete(TODAY, null, user, NOW, TODAY);

    HealthProcedure booster = procedure.scheduleBooster(TODAY.plusYears(1), user, NOW, TODAY);

    assertThat(booster.getStatus()).isEqualTo(HealthProcedureStatus.Scheduled);
    assertThat(booster.getName()).isEqualTo("Antirrábica");
    assertThat(booster.getPreviousHealthProcedure()).isSameAs(procedure);
  }

  @Test
  void rejectsABoosterForAnythingButACompletedVaccine() {
    HealthProcedure scheduledVaccine = vaccine(TODAY);
    HealthProcedure deworming =
        HealthProcedure.schedule(
            cat, HealthProcedureType.Deworming, "Drontal", TODAY, null, user, NOW, TODAY);
    deworming.complete(TODAY, null, user, NOW, TODAY);

    assertThatThrownBy(() -> scheduledVaccine.scheduleBooster(TODAY.plusYears(1), user, NOW, TODAY))
        .isInstanceOf(InvalidHealthProcedureException.class);
    assertThatThrownBy(() -> deworming.scheduleBooster(TODAY.plusYears(1), user, NOW, TODAY))
        .isInstanceOf(InvalidHealthProcedureException.class);
  }

  @Test
  void rejectsABoosterOnOrBeforeTheVaccineDate() {
    HealthProcedure procedure = vaccine(TODAY);
    procedure.complete(TODAY, null, user, NOW, TODAY);

    assertThatThrownBy(() -> procedure.scheduleBooster(TODAY, user, NOW, TODAY))
        .isInstanceOf(InvalidHealthProcedureException.class);
  }

  @Test
  void isOverdueOnlyWhileScheduledAndPastTheDate() {
    HealthProcedure procedure = vaccine(TODAY);

    assertThat(procedure.isOverdue(TODAY)).isFalse();
    assertThat(procedure.isOverdue(TODAY.plusDays(1))).isTrue();

    procedure.complete(TODAY, null, user, NOW, TODAY);

    assertThat(procedure.isOverdue(TODAY.plusDays(1))).isFalse();
  }

  private HealthProcedure vaccine(LocalDate scheduledDate) {
    return HealthProcedure.schedule(
        cat, HealthProcedureType.Vaccine, " Antirrábica ", scheduledDate, null, user, NOW, TODAY);
  }

  private HealthProcedure neutering() {
    return HealthProcedure.schedule(
        cat, HealthProcedureType.Neutering, null, TODAY, null, user, NOW, TODAY);
  }
}
