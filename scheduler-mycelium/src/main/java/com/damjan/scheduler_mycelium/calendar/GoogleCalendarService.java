package com.damjan.scheduler_mycelium.calendar;

import com.damjan.scheduler_mycelium.config.GoogleCalendarConfig;
import com.damjan.scheduler_mycelium.domain.account.Account;
import com.damjan.scheduler_mycelium.domain.account.AccountRepository;
import com.damjan.scheduler_mycelium.domain.account.GoogleCalendarToken;
import com.damjan.scheduler_mycelium.domain.account.GoogleCalendarTokenRepository;
import com.damjan.scheduler_mycelium.domain.appointment.Appointment;
import com.damjan.scheduler_mycelium.security.TokenEncryptionUtil;
import com.google.api.client.auth.oauth2.ClientParametersAuthentication;
import com.google.api.client.auth.oauth2.RefreshTokenRequest;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.stream.Collectors;

/**
 * Manages the full Google Calendar integration lifecycle:
 * <ul>
 *   <li>OAuth2 authorization URL generation</li>
 *   <li>Authorization code exchange and token persistence</li>
 *   <li>Calendar event creation on booking</li>
 *   <li>Calendar event deletion on cancellation</li>
 *   <li>Silent token refresh</li>
 * </ul>
 *
 * <p>Every calendar operation is wrapped in try/catch and fails silently.
 * A calendar failure NEVER prevents a booking or cancellation from succeeding.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarService {

    private final GoogleCalendarConfig config;
    private final GoogleCalendarTokenRepository tokenRepository;
    private final AccountRepository accountRepository;
    private final TokenEncryptionUtil encryptionUtil;

    // ── OAuth Flow ────────────────────────────────────────────────────────────

    /**
     * Builds the Google consent screen URL.
     * The {@code accountId} is carried through as the OAuth {@code state} parameter
     * so the callback knows which account to attach the token to.
     */
    public String buildAuthorizationUrl(Long accountId) {
        if (!config.isConfigured()) {
            throw new IllegalStateException(
                "Google Calendar is not configured. Set GOOGLE_CLIENT_ID, " +
                "GOOGLE_CLIENT_SECRET, and GOOGLE_TOKEN_ENCRYPTION_KEY.");
        }
        try {
            GoogleAuthorizationCodeFlow flow = config.buildFlow();
            return flow.newAuthorizationUrl()
                .setRedirectUri(config.getRedirectUri())
                .setState(accountId.toString())
                .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to build Google OAuth URL", e);
        }
    }

    /**
     * Called after Google redirects back with an authorization code.
     * Exchanges the code for access + refresh tokens and stores them encrypted.
     */
    @Transactional
    public void exchangeCodeAndSaveToken(String code, String state) {
        try {
            Long accountId = Long.parseLong(state);
            Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountId));

            GoogleAuthorizationCodeFlow flow = config.buildFlow();
            GoogleTokenResponse tokenResponse = flow
                .newTokenRequest(code)
                .setRedirectUri(config.getRedirectUri())
                .execute();

            // Fetch the Google account email so the UI can display it
            String googleEmail = fetchGoogleEmail(tokenResponse);

            LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(tokenResponse.getExpiresInSeconds() != null
                    ? tokenResponse.getExpiresInSeconds() : 3600L);

            // Remove any existing token (reconnect scenario)
            tokenRepository.deleteByAccountId(accountId);

            GoogleCalendarToken token = GoogleCalendarToken.builder()
                .account(account)
                .accessToken(encryptionUtil.encrypt(tokenResponse.getAccessToken()))
                .refreshToken(encryptionUtil.encrypt(tokenResponse.getRefreshToken()))
                .expiresAt(expiresAt)
                .googleEmail(googleEmail)
                .calendarId("primary")
                .build();

            tokenRepository.save(token);
            log.info("Google Calendar connected for account {}", accountId);

        } catch (Exception e) {
            log.error("Failed to exchange Google OAuth code", e);
            throw new RuntimeException("Google Calendar connection failed: " + e.getMessage(), e);
        }
    }

    // ── Calendar Operations ───────────────────────────────────────────────────

    /**
     * Creates a Google Calendar event for the given appointment.
     *
     * @return the Google event ID (to be stored on the appointment), or null if
     *         the owner is not connected or if any error occurs.
     */
    public String createCalendarEvent(Long ownerAccountId, Appointment appointment) {
        try {
            com.google.api.services.calendar.Calendar calendarService =
                buildCalendarService(ownerAccountId);
            if (calendarService == null) return null;

            GoogleCalendarToken tokenEntity =
                tokenRepository.findByAccountId(ownerAccountId).orElse(null);
            if (tokenEntity == null) return null;

            Event event = buildEvent(appointment);
            Event created = calendarService.events()
                .insert(tokenEntity.getCalendarId(), event)
                .execute();

            log.info("Created Google Calendar event {} for appointment {}",
                created.getId(), appointment.getPublicId());
            return created.getId();

        } catch (Exception e) {
            // Never fail the booking — just log and return null
            log.error("Failed to create Google Calendar event for appointment {}: {}",
                appointment.getPublicId(), e.getMessage());
            return null;
        }
    }

    /**
     * Deletes the Google Calendar event associated with a cancelled appointment.
     * Completely silent on any error.
     */
    public void deleteCalendarEvent(Long ownerAccountId, String googleEventId) {
        if (googleEventId == null || googleEventId.isBlank()) return;
        try {
            com.google.api.services.calendar.Calendar calendarService =
                buildCalendarService(ownerAccountId);
            if (calendarService == null) return;

            GoogleCalendarToken tokenEntity =
                tokenRepository.findByAccountId(ownerAccountId).orElse(null);
            if (tokenEntity == null) return;

            calendarService.events()
                .delete(tokenEntity.getCalendarId(), googleEventId)
                .execute();

            log.info("Deleted Google Calendar event {}", googleEventId);

        } catch (Exception e) {
            log.error("Failed to delete Google Calendar event {}: {}",
                googleEventId, e.getMessage());
        }
    }

    // ── Connection Status ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CalendarStatusDTO getStatus(Long accountId) {
        return tokenRepository.findByAccountId(accountId)
            .map(t -> new CalendarStatusDTO(true, t.getGoogleEmail()))
            .orElse(new CalendarStatusDTO(false, null));
    }

    @Transactional
    public void disconnect(Long accountId) {
        tokenRepository.deleteByAccountId(accountId);
        log.info("Google Calendar disconnected for account {}", accountId);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private com.google.api.services.calendar.Calendar buildCalendarService(Long accountId) {
        try {
            GoogleCalendarToken tokenEntity =
                tokenRepository.findByAccountId(accountId).orElse(null);
            if (tokenEntity == null) return null;

            String accessToken;
            if (tokenEntity.isExpired()) {
                accessToken = refreshAccessToken(tokenEntity);
                if (accessToken == null) return null;
            } else {
                accessToken = encryptionUtil.decrypt(tokenEntity.getAccessToken());
            }

            final String finalToken = accessToken;
            HttpRequestInitializer credential = request ->
                request.getHeaders().setAuthorization("Bearer " + finalToken);

            return new com.google.api.services.calendar.Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                credential)
                .setApplicationName("Scheduler Mycelium")
                .build();

        } catch (Exception e) {
            log.error("Failed to build Calendar service for account {}: {}",
                accountId, e.getMessage());
            return null;
        }
    }

    private String refreshAccessToken(GoogleCalendarToken tokenEntity) {
        try {
            String refreshToken = encryptionUtil.decrypt(tokenEntity.getRefreshToken());

            TokenResponse response = new RefreshTokenRequest(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new GenericUrl("https://oauth2.googleapis.com/token"),
                refreshToken)
                .setClientAuthentication(new ClientParametersAuthentication(
                    config.getClientId(), config.getClientSecret()))
                .execute();

            String newAccessToken = response.getAccessToken();
            LocalDateTime newExpiry = LocalDateTime.now()
                .plusSeconds(response.getExpiresInSeconds() != null
                    ? response.getExpiresInSeconds() : 3600L);

            tokenEntity.setAccessToken(encryptionUtil.encrypt(newAccessToken));
            tokenEntity.setExpiresAt(newExpiry);
            tokenRepository.save(tokenEntity);

            log.info("Refreshed Google access token for account {}",
                tokenEntity.getAccount().getId());
            return newAccessToken;

        } catch (Exception e) {
            log.error("Failed to refresh Google token for account {}: {}",
                tokenEntity.getAccount().getId(), e.getMessage());
            return null;
        }
    }

    private String fetchGoogleEmail(GoogleTokenResponse tokenResponse) {
        try {
            // Call Google's userinfo endpoint directly — no extra dependency required
            URL url = new URL("https://www.googleapis.com/oauth2/v2/userinfo");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", "Bearer " + tokenResponse.getAccessToken());
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            if (conn.getResponseCode() == 200) {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream()))) {
                    String body = reader.lines().collect(Collectors.joining());
                    // Simple JSON parse — extract "email":"value"
                    int emailIdx = body.indexOf("\"email\"");
                    if (emailIdx >= 0) {
                        int start = body.indexOf('"', emailIdx + 7) + 1;
                        int end = body.indexOf('"', start);
                        if (start > 0 && end > start) {
                            return body.substring(start, end);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch Google account email: {}", e.getMessage());
        }
        return null;
    }


    private Event buildEvent(Appointment appointment) {
        String customerName = resolveCustomerName(appointment);
        String title = appointment.getService().getName() + " \u2014 " + customerName;

        StringBuilder description = new StringBuilder();
        description.append("Service: ")
            .append(appointment.getService().getName())
            .append(" (")
            .append(appointment.getService().getDurationMinutes())
            .append(" min)\n");
        description.append("Customer: ").append(customerName).append("\n");

        String phone = appointment.getGuestPhone() != null
            ? appointment.getGuestPhone()
            : (appointment.getCustomer() != null
                ? appointment.getCustomer().getPhone() : null);
        if (phone != null) {
            description.append("Phone: ").append(phone).append("\n");
        }

        if (appointment.getNotes() != null && !appointment.getNotes().isBlank()) {
            description.append("Notes: ").append(appointment.getNotes()).append("\n");
        }

        description.append("\nBooked via Scheduler Mycelium");

        ZoneId zone = ZoneId.systemDefault();
        DateTime startDateTime = new DateTime(
            appointment.getStartTime().atZone(zone).toInstant().toEpochMilli());
        DateTime endDateTime = new DateTime(
            appointment.getEndTime().atZone(zone).toInstant().toEpochMilli());

        String location = appointment.getBusiness().getAddress();

        return new Event()
            .setSummary(title)
            .setDescription(description.toString())
            .setLocation(location)
            .setStart(new EventDateTime().setDateTime(startDateTime))
            .setEnd(new EventDateTime().setDateTime(endDateTime));
    }

    private String resolveCustomerName(Appointment appointment) {
        if (appointment.getGuestName() != null) return appointment.getGuestName();
        if (appointment.getCustomer() != null) return appointment.getCustomer().getFullName();
        return "Walk-in";
    }
}
