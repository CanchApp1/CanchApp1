package com.canchapp.CanchAPP_Back.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

  @Bean
  public OpenAPI customOpenAPI() {
    // Configuramos el esquema de seguridad (preparando para el JWT de tu arquitectura)
    final String securitySchemeName = "bearerAuth";

    return new OpenAPI()
      .info(new Info()
        .title("API CanchAPP - Microservicio")
        .version("1.0.0")
        .description("Documentación oficial de los endpoints del microservicio de usuarios para la plataforma.")
        .contact(new Contact()
          .name("UNIMAYOR")
          .email("jecuadros@unimayor.edu.co"))
        .license(new License().name("Apache 2.0").url("http://springdoc.org")))
      // Todo esto es para que Swagger muestre el botón "Authorize" e inyecte el JWT
      .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
      .components(new Components()
        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
          .name(securitySchemeName)
          .type(SecurityScheme.Type.HTTP)
          .scheme("bearer")
          .bearerFormat("JWT")));
  }
}
