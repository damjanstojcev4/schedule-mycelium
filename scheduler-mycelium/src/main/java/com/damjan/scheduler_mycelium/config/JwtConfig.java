package com.damjan.scheduler_mycelium.config;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * JWT configuration bound from the {@code jwt.*} properties namespace.
 * <p>
 * Required environment variables:
 * <ul>
 *   <li>{@code JWT_SECRET} — at least 32 characters (64 hex chars recommended)</li>
 *   <li>{@code JWT_EXPIRATION_MS} — token lifetime in milliseconds (default: 86400000 = 24 h)</li>
 * </ul>
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {
    private String secret;
    private long expirationMs;

    /**
     * Validates configuration eagerly at startup so the application fails fast
     * if JWT_SECRET is missing or too short, rather than at the first token operation.
     */
    @PostConstruct
    public void validate() {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException(
                    "JWT_SECRET environment variable is not set. " +
                    "Generate one with: openssl rand -hex 64");
        }
        if (secret.length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least 32 characters long for HMAC-SHA256. " +
                    "Current length: " + secret.length());
        }
        if (expirationMs <= 0) {
            throw new IllegalStateException(
                    "JWT_EXPIRATION_MS must be a positive value (milliseconds). Got: " + expirationMs);
        }
    }
}
