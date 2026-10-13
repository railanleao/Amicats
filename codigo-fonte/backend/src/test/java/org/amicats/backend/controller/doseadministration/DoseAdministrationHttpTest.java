package org.amicats.backend.controller.doseadministration;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.servlet.Filter;
import java.time.LocalDateTime;
import java.util.UUID;
import org.amicats.backend.application.factory.doseadministration.ReadDoseAdministrationFactory;
import org.amicats.backend.application.factory.doseadministration.RegisterDoseAdministrationFactory;
import org.amicats.backend.config.IdempotencyFilter;
import org.amicats.backend.config.RateLimitFilter;
import org.amicats.backend.config.SecurityConfig;
import org.amicats.backend.domain.enums.AdministrationRoute;
import org.amicats.backend.domain.enums.DoseRegistrationOrigin;
import org.amicats.backend.domain.usecase.doseadministration.read.ReadDoseAdministrationOutput;
import org.amicats.backend.domain.usecase.doseadministration.read.ReadDoseAdministrationUseCase;
import org.amicats.backend.domain.usecase.doseadministration.register.RegisterDoseAdministrationInput;
import org.amicats.backend.domain.usecase.doseadministration.register.RegisterDoseAdministrationResult;
import org.amicats.backend.domain.usecase.doseadministration.register.RegisterDoseAdministrationUseCase;
import org.amicats.backend.repository.idempotency.IdempotencyStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.junit.jupiter.web.SpringJUnitWebConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

/** HTTP contract with the production security chain and method authorization; no database. */
@SpringJUnitWebConfig(DoseAdministrationHttpTest.Config.class)
class DoseAdministrationHttpTest {
  private static final UUID OPERATION_ID = UUID.fromString("cc79e99a-81dd-45e2-80e0-514b1a5a21cb");
  private static final LocalDateTime APPLIED = LocalDateTime.of(2026, 10, 8, 14, 0);
  private static final String BODY =
      """
      {
        "clientOperationId": "cc79e99a-81dd-45e2-80e0-514b1a5a21cb",
        "administeredAt": "2026-10-08T14:00:00",
        "notes": null,
        "origin": "Online"
      }
      """;

  @Autowired private WebApplicationContext context;
  @Autowired private JwtDecoder decoder;
  @Autowired private RegisterDoseAdministrationFactory registerFactory;
  @Autowired private ReadDoseAdministrationFactory readFactory;
  private RegisterDoseAdministrationUseCase register;
  private MockMvc mvc;

  @BeforeEach
  void setUp() {
    reset(decoder, registerFactory, readFactory);
    register = mock(RegisterDoseAdministrationUseCase.class);
    mvc =
        MockMvcBuilders.webAppContextSetup(context)
            .addFilters(context.getBean("springSecurityFilterChain", Filter.class))
            .build();
  }

  @ParameterizedTest
  @ValueSource(strings = {"Administrator", "Veterinarian", "Assistant"})
  void returns201Then200ForTheSameOperation(String role) throws Exception {
    authenticate(role);
    when(registerFactory.create()).thenReturn(register);
    var input =
        new RegisterDoseAdministrationInput(
            OPERATION_ID, APPLIED, null, DoseRegistrationOrigin.Online);
    when(register.execute(12, 7, input))
        .thenReturn(
            new RegisterDoseAdministrationResult(output(), true),
            new RegisterDoseAdministrationResult(output(), false));

    mvc.perform(
            post("/prescribed-medications/12/doses")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(BODY))
        .andExpect(status().isCreated())
        .andExpect(header().string("Location", "/dose-administrations/42"))
        .andExpect(jsonPath("$.id").value(42))
        .andExpect(jsonPath("$.clientOperationId").value(OPERATION_ID.toString()));

    mvc.perform(
            post("/prescribed-medications/12/doses")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(BODY))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(42))
        .andExpect(jsonPath("$.clientOperationId").value(OPERATION_ID.toString()));
    verify(register, times(2)).execute(12, 7, input);
  }

  @Test
  void viewerCannotRegisterDoses() throws Exception {
    authenticate("Viewer");
    mvc.perform(
            post("/prescribed-medications/12/doses")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(BODY))
        .andExpect(status().isForbidden());
    verifyNoInteractions(registerFactory);
  }

  @Test
  void anonymousCannotRegisterDoses() throws Exception {
    mvc.perform(
            post("/prescribed-medications/12/doses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(BODY))
        .andExpect(status().isUnauthorized());
    verifyNoInteractions(registerFactory);
  }

  @Test
  void viewerCanReadDoses() throws Exception {
    authenticate("Viewer");
    var read = mock(ReadDoseAdministrationUseCase.class);
    when(readFactory.create()).thenReturn(read);
    when(read.findById(42, 7)).thenReturn(output());
    mvc.perform(get("/dose-administrations/42").header("Authorization", "Bearer test-token"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(42));
    verify(read).findById(42, 7);
  }

  private void authenticate(String role) {
    when(decoder.decode("test-token"))
        .thenReturn(
            Jwt.withTokenValue("test-token")
                .header("alg", "RS256")
                .subject("7")
                .claim("role", role)
                .claim("termsAccepted", true)
                .claim("mustChangePassword", false)
                .build());
  }

  private ReadDoseAdministrationOutput output() {
    return new ReadDoseAdministrationOutput(
        42,
        12,
        1,
        5,
        "Medicamento",
        "1 ml",
        AdministrationRoute.Oral,
        7,
        "Responsável",
        APPLIED,
        APPLIED,
        null,
        DoseRegistrationOrigin.Online,
        OPERATION_ID);
  }

  @Configuration
  @EnableWebMvc
  @EnableWebSecurity
  @EnableMethodSecurity(proxyTargetClass = true)
  @Import({
    SecurityConfig.class,
    DoseAdministrationControllerImpl.class,
    RateLimitFilter.class,
    IdempotencyFilter.class
  })
  static class Config {
    @Bean
    JwtDecoder decoder() {
      return mock(JwtDecoder.class);
    }

    @Bean
    IdempotencyStore idempotencyStore() {
      return mock(IdempotencyStore.class);
    }

    @Bean
    RegisterDoseAdministrationFactory registerFactory() {
      return mock(RegisterDoseAdministrationFactory.class);
    }

    @Bean
    ReadDoseAdministrationFactory readFactory() {
      return mock(ReadDoseAdministrationFactory.class);
    }
  }
}
