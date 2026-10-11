package org.amicats.backend.controller.doseadministration;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.stream.Stream;
import org.amicats.backend.application.factory.doseadministration.ReadDoseAdministrationFactory;
import org.amicats.backend.application.factory.doseadministration.RegisterDoseAdministrationFactory;
import org.amicats.backend.domain.usecase.doseadministration.read.ReadDoseAdministrationUseCase;
import org.amicats.backend.exception.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.core.MethodParameter;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/** Verifies HTTP exception mapping, not the security filter chain. */
class DoseAdministrationErrorContractTest {
  @ParameterizedTest
  @MethodSource("errors")
  void preservesResponseStatusWithoutAModuleSpecificProblemDetail(
      RuntimeException error, int expectedStatus) throws Exception {
    var readFactory = mock(ReadDoseAdministrationFactory.class);
    var read = mock(ReadDoseAdministrationUseCase.class);
    when(readFactory.create()).thenReturn(read);
    when(read.findById(999, 7)).thenThrow(error);
    var controller =
        new DoseAdministrationControllerImpl(
            mock(RegisterDoseAdministrationFactory.class), readFactory);
    var jwt = Jwt.withTokenValue("test").header("alg", "HS256").subject("7").build();
    var mvc =
        MockMvcBuilders.standaloneSetup(controller)
            .setCustomArgumentResolvers(
                new HandlerMethodArgumentResolver() {
                  @Override
                  public boolean supportsParameter(MethodParameter parameter) {
                    return parameter.getParameterType() == Jwt.class;
                  }

                  @Override
                  public Object resolveArgument(
                      MethodParameter parameter,
                      ModelAndViewContainer container,
                      NativeWebRequest request,
                      WebDataBinderFactory binderFactory) {
                    return jwt;
                  }
                })
            .build();
    var response =
        mvc.perform(get("/dose-administrations/999"))
            .andExpect(status().is(expectedStatus))
            .andReturn()
            .getResponse();
    assertThat(response.getContentType()).isNotEqualTo("application/problem+json");
    assertThat(response.getContentAsString()).doesNotContain("\"detail\"");
  }

  static Stream<Arguments> errors() {
    return Stream.of(
        Arguments.of(new InvalidDoseAdministrationException("Teste"), 400),
        Arguments.of(new DoseAdministrationAccessException("Teste"), 403),
        Arguments.of(new ResourceNotFoundException("Teste"), 404),
        Arguments.of(new DoseAdministrationConflictException("Teste"), 409));
  }
}
