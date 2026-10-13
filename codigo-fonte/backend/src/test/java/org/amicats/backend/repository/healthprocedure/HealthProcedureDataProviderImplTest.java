package org.amicats.backend.repository.healthprocedure;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class HealthProcedureDataProviderImplTest {

  @Test
  void escapesTheLikeWildcardsTypedByTheUser() {
    assertThat(HealthProcedureDataProviderImpl.toSearchPattern(" V4_100% "))
        .isEqualTo("%v4!_100!%%");
    assertThat(HealthProcedureDataProviderImpl.toSearchPattern("a!b")).isEqualTo("%a!!b%");
  }

  @Test
  void returnsNullForABlankSearch() {
    assertThat(HealthProcedureDataProviderImpl.toSearchPattern("  ")).isNull();
    assertThat(HealthProcedureDataProviderImpl.toSearchPattern(null)).isNull();
  }
}
