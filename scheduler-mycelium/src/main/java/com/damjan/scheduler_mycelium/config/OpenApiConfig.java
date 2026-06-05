package com.damjan.scheduler_mycelium.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI schedulerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Scheduler Mycelium API")
                        .version("v1")
                        .description("""
                                Multi-tenant appointment scheduling API for salons, clinics, and similar businesses.

                                **Quick start**

                                1. Register — POST /api/auth/register (email, password, role: CUSTOMER, BUSINESS_OWNER, or STAFF)
                                2. Login — POST /api/auth/login (returns JWT in token)
                                3. Authorize — Click Authorize in Swagger UI and paste the token
                                4. Browse — GET /api/businesses (public)
                                5. Slots — GET /api/slots with businessId, staffId, serviceId, date (public)
                                6. Book — POST /api/appointments (requires JWT as CUSTOMER)

                                **Authentication**

                                Protected routes use header: Authorization: Bearer &lt;JWT&gt;

                                Public (no JWT): /api/auth/register, /api/auth/login, /api/businesses/**, /api/slots/**

                                JWT required: /api/appointments/**, /api/customers/**

                                Owner/staff writes under /api/businesses/{id}/... accept optional JWT for role checks in services.

                                **Typical flows**

                                Customer: CUSTOMER → login → businesses → slots → book → GET /api/appointments/my → PATCH cancel

                                Owner: BUSINESS_OWNER → login → POST /api/businesses → settings, closures, staff, services

                                Staff: STAFF → PATCH /api/appointments/{id}/complete

                                **Errors**

                                JSON: status, error, message. Validation adds fieldErrors. Codes: 400, 401, 403, 404, 409.
                                """)
                        .contact(new Contact().name("Scheduler Mycelium")))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT from login or register. Use: Bearer <token>")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH));
    }
}
