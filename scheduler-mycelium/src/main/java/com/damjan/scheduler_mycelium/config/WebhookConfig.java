package com.damjan.scheduler_mycelium.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * Provides a Spring-managed {@link RestClient} with explicit connect and read
 * timeouts. Injected into {@code WebhookService} so the webhook fire never
 * blocks an application thread indefinitely.
 *
 * <p>Note: Spring Boot 4 / Spring 6 removed {@code RestTemplateBuilder}.
 * {@link RestClient} is the modern replacement with a fluent API.
 */
@Configuration
public class WebhookConfig {

    @Bean
    public RestClient webhookRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(10));

        return RestClient.builder()
                .requestFactory(factory)
                .build();
    }
}
