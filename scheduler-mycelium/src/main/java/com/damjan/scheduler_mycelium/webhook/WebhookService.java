package com.damjan.scheduler_mycelium.webhook;

import com.damjan.scheduler_mycelium.domain.appointment.Appointment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class WebhookService {

    @Value("${webhook.booking-confirmed-url}")
    private String bookingConfirmedUrl;

    @Value("${webhook.booking-cancelled-url}")
    private String bookingCancelledUrl;

    private final RestTemplate restTemplate = new RestTemplate();

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
            restTemplate.postForEntity(url, payload, String.class);
        } catch (Exception e) {
            // Never fail the booking if the webhook fails
            // Just log and continue
            System.err.println("[WebhookService] Webhook call failed: " + e.getMessage());
        }
    }
}
