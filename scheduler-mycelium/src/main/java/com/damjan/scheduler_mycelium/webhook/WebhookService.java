package com.damjan.scheduler_mycelium.webhook;

import com.damjan.scheduler_mycelium.domain.appointment.Appointment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

/**
 * Fires n8n webhook calls for booking lifecycle events.
 * <p>
 * Failures are intentionally swallowed — a webhook error must never roll back
 * a booking. All failures are logged at WARN level for observability.
 * <p>
 * The injected {@link RestClient} is configured with connect/read timeouts
 * in {@link com.damjan.scheduler_mycelium.config.WebhookConfig}.
 */
@Slf4j
@Service
public class WebhookService {

    @Value("${webhook.booking-confirmed-url}")
    private String bookingConfirmedUrl;

    @Value("${webhook.booking-cancelled-url}")
    private String bookingCancelledUrl;

    // Named bean from WebhookConfig — configured with 5s connect / 10s read timeouts.
    private final RestClient restClient;

    public WebhookService(@Qualifier("webhookRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public void sendBookingConfirmation(Appointment appointment) {
        Map<String, Object> payload = buildPayload(appointment, "CONFIRMED");
        fireWebhook(bookingConfirmedUrl, payload);
    }

    public void sendCancellationNotification(Appointment appointment) {
        Map<String, Object> payload = buildPayload(appointment, "CANCELLED");
        fireWebhook(bookingCancelledUrl, payload);
    }

    private Map<String, Object> buildPayload(Appointment appointment, String event) {
        Map<String, Object> payload = new HashMap<>();

        // Event type
        payload.put("event", event);

        // Appointment details
        payload.put("appointmentId", appointment.getPublicId().toString());
        payload.put("serviceName", appointment.getService().getName());
        payload.put("serviceDurationMinutes", appointment.getService().getDurationMinutes());
        payload.put("startTime", appointment.getStartTime().toString());
        payload.put("endTime", appointment.getEndTime().toString());

        // Business details — for personalized emails
        payload.put("businessName", appointment.getBusiness().getName());
        payload.put("businessEmail", appointment.getBusiness().getOwner().getEmail());
        payload.put("businessPhone", appointment.getBusiness().getPhone());
        payload.put("businessAddress", appointment.getBusiness().getAddress());
        payload.put("businessSlug", appointment.getBusiness().getSlug());

        // Customer details — guest or registered
        if (appointment.getGuestEmail() != null) {
            payload.put("customerName", appointment.getGuestName());
            payload.put("customerEmail", appointment.getGuestEmail());
            payload.put("customerPhone", appointment.getGuestPhone());
            payload.put("isGuest", true);
        } else if (appointment.getCustomer() != null) {
            payload.put("customerName", appointment.getCustomer().getFullName());
            payload.put("customerEmail", appointment.getCustomer().getAccount().getEmail());
            payload.put("customerPhone", appointment.getCustomer().getPhone());
            payload.put("isGuest", false);
        }

        return payload;
    }

    private void fireWebhook(String url, Map<String, Object> payload) {
        try {
            log.debug("Firing webhook [{}] for appointment {}", url, payload.get("appointmentId"));
            restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            log.debug("Webhook fired successfully [{}]", url);
        } catch (Exception e) {
            // Never fail the booking if the webhook fails — log and continue.
            log.warn("Webhook call failed [url={}] — {}: {}",
                    url, e.getClass().getSimpleName(), e.getMessage());
        }
    }
}
