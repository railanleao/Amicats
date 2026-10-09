package org.amicats.backend.domain.usecase.healthprocedure.create;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.HealthProcedure;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.enums.HealthProcedureStatus;
import org.amicats.backend.domain.enums.HealthProcedureType;
import org.amicats.backend.domain.interfaces.dataprovider.cat.CatDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.healthprocedure.HealthProcedureDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.healthprocedure.read.ReadHealthProcedureOutput;
import org.amicats.backend.exception.HealthProcedureConflictException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CreateHealthProcedureUseCaseTest {

  private static final Integer CAT_ID = 2;
  private static final Integer USER_ID = 7;

  @Mock private HealthProcedureDataProvider healthProcedureDataProvider;
  @Mock private CatDataProvider catDataProvider;
  @Mock private UserDataProvider userDataProvider;

  private CreateHealthProcedureUseCase useCase;
  private Cat cat;

  @BeforeEach
  void setUp() {
    Clock clock = Clock.fixed(Instant.parse("2026-10-09T15:00:00Z"), ZoneOffset.UTC);

    useCase =
        CreateHealthProcedureUseCase.builder()
            .healthProcedureDataProvider(healthProcedureDataProvider)
            .catDataProvider(catDataProvider)
            .userDataProvider(userDataProvider)
            .clock(clock)
            .build();

    User user = mock(User.class);
    lenient().when(user.getFullName()).thenReturn("Camila Prado");
    lenient().when(userDataProvider.findById(USER_ID)).thenReturn(Optional.of(user));

    cat = mock(Cat.class);
    lenient().when(cat.getId()).thenReturn(CAT_ID);
    lenient().when(cat.getName()).thenReturn("Tobias");
    lenient().when(catDataProvider.findById(CAT_ID)).thenReturn(Optional.of(cat));
  }

  @Test
  void schedulesAVaccine() {
    ReadHealthProcedureOutput output =
        useCase.execute(
            USER_ID,
            new CreateHealthProcedureInput(
                CAT_ID,
                HealthProcedureType.Vaccine,
                "Antirrábica",
                LocalDate.of(2026, 10, 20),
                null));

    assertThat(output.status()).isEqualTo(HealthProcedureStatus.Scheduled);
    assertThat(output.catName()).isEqualTo("Tobias");
    assertThat(output.createdByName()).isEqualTo("Camila Prado");
    verify(healthProcedureDataProvider).save(any(HealthProcedure.class));
  }

  @Test
  void blocksASecondScheduledNeutering() {
    when(healthProcedureDataProvider.existsScheduled(CAT_ID, HealthProcedureType.Neutering))
        .thenReturn(true);

    assertThatThrownBy(
            () ->
                useCase.execute(
                    USER_ID,
                    new CreateHealthProcedureInput(
                        CAT_ID,
                        HealthProcedureType.Neutering,
                        null,
                        LocalDate.of(2026, 10, 20),
                        null)))
        .isInstanceOf(HealthProcedureConflictException.class)
        .hasMessageContaining("Tobias já tem uma castração agendada");

    verify(healthProcedureDataProvider, never()).save(any());
  }

  @Test
  void rejectsAnUnknownCat() {
    when(catDataProvider.findById(99)).thenReturn(Optional.empty());

    assertThatThrownBy(
            () ->
                useCase.execute(
                    USER_ID,
                    new CreateHealthProcedureInput(
                        99, HealthProcedureType.Vaccine, "V4", LocalDate.of(2026, 10, 20), null)))
        .isInstanceOf(ResourceNotFoundException.class);
  }
}
