package com.damjan.scheduler_mycelium;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Smoke test — verifies the Spring application context loads successfully.
 *
 * Uses test-only property overrides so no real database or JWT secret is
 * required in the CI environment.
 *
 * Note: The datasource is set to an H2 in-memory database here; if you only
 * have PostgreSQL available in CI, add a real test DB service in the
 * GitHub Actions workflow instead of using H2 here.
 */
@SpringBootTest
@TestPropertySource(properties = {
        // Provide a valid JWT secret so JwtConfig passes @PostConstruct validation
        "jwt.secret=this-is-a-test-secret-that-is-at-least-32-chars-long",
        "jwt.expiration-ms=86400000",
        // Point to a test DB. Override with SPRING_DATASOURCE_URL in CI.
        "spring.datasource.url=jdbc:postgresql://localhost:5432/schedule_test",
        "spring.datasource.username=postgres",
        "spring.datasource.password=postgres",
        // Allow Hibernate to create the schema for tests (no Flyway needed)
        "spring.jpa.hibernate.ddl-auto=create-drop",
        // Suppress SQL noise in test output
        "spring.jpa.show-sql=false",
        // CORS can point anywhere in tests
        "cors.allowed-origins=http://localhost:3000",
        // Use placeholder webhook URLs for tests
        "webhook.booking-confirmed-url=http://localhost/test-webhook-confirmed",
        "webhook.booking-cancelled-url=http://localhost/test-webhook-cancelled",
        // Disable Actuator startup checks that might fail without infra
        "management.health.db.enabled=false"
})
class SchedulerMyceliumApplicationTests {

    @Test
    void contextLoads() {
        // If the Spring context starts without throwing, this test passes.
        // This catches misconfigured beans, missing required properties,
        // and wiring issues before they reach production.
    }
}
