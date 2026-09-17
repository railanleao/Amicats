package org.amicats.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  private static final String BEARER_SCHEME_NAME = "bearerAuth";

  @Bean
  public OpenAPI apiInfo() {
    return new OpenAPI()
            .info(
                    new Info()
                            .title("Amicats API")
                            .version("1.0.0")
                            .description("API REST da ONG Amicats"))
            .components(
                    new Components()
                            .addSecuritySchemes(
                                    BEARER_SCHEME_NAME,
                                    new SecurityScheme()
                                            .type(SecurityScheme.Type.HTTP)
                                            .scheme("bearer")
                                            .bearerFormat("JWT")))
            .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME_NAME));
  }
}