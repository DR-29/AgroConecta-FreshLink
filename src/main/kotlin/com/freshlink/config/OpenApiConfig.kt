package com.freshlink.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun customOpenAPI(): OpenAPI {
        val securitySchemeName = "bearerAuth"
        return OpenAPI()
            .info(Info().title("FreshLink API").version("1.0.0")
                .description("API para conectar productores, tiendas y transportistas del campo"))
            .addSecurityItem(SecurityRequirement().addList(securitySchemeName))
            .components(Components().addSecuritySchemes(securitySchemeName,
                SecurityScheme()
                    .name(securitySchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
            ))
    }
}
