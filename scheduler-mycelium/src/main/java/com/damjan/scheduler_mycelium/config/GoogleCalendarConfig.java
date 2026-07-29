package com.damjan.scheduler_mycelium.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "google.calendar")
@Data
@Slf4j
public class GoogleCalendarConfig {

    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String tokenEncryptionKey;

    private static final List<String> SCOPES =
        List.of("https://www.googleapis.com/auth/calendar.events");

    /**
     * Returns true only when all required Google credentials are configured.
     * When false, calendar operations are silently skipped — the app still starts.
     */
    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank()
            && clientSecret != null && !clientSecret.isBlank()
            && tokenEncryptionKey != null && !tokenEncryptionKey.isBlank();
    }

    public GoogleAuthorizationCodeFlow buildFlow() throws IOException, GeneralSecurityException {
        GoogleClientSecrets secrets = new GoogleClientSecrets()
            .setInstalled(new GoogleClientSecrets.Details()
                .setClientId(clientId)
                .setClientSecret(clientSecret));

        return new GoogleAuthorizationCodeFlow.Builder(
            GoogleNetHttpTransport.newTrustedTransport(),
            GsonFactory.getDefaultInstance(),
            secrets,
            SCOPES)
            .setAccessType("offline")
            .setApprovalPrompt("force")
            .build();
    }

    public List<String> getScopes() {
        return SCOPES;
    }
}
