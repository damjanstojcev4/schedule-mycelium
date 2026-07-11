package com.damjan.scheduler_mycelium.public_cancel;

import com.damjan.scheduler_mycelium.domain.appointment.Appointment;
import com.damjan.scheduler_mycelium.domain.appointment.AppointmentRepository;
import com.damjan.scheduler_mycelium.domain.appointment.dto.CancelConfirmationDTO;
import com.damjan.scheduler_mycelium.domain.appointment.dto.GuestAppointmentDTO;
import com.damjan.scheduler_mycelium.domain.business.BusinessSettings;
import com.damjan.scheduler_mycelium.domain.business.BusinessSettingsRepository;
import com.damjan.scheduler_mycelium.exception.ResourceNotFoundException;
import com.damjan.scheduler_mycelium.webhook.WebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class PublicCancellationService {

    private final AppointmentRepository appointmentRepository;
    private final BusinessSettingsRepository businessSettingsRepository;
    private final WebhookService webhookService;

    // ─── Query ────────────────────────────────────────────────────────────────

    /**
     * Returns upcoming BOOKED appointments for the given email.
     * Business settings are loaded in a single batch query — one DB round-trip
     * regardless of how many appointments or distinct businesses are involved.
     */
    @Transactional(readOnly = true)
    public List<GuestAppointmentDTO> getBookedAppointmentsByEmail(String email) {
        List<Appointment> appointments = appointmentRepository
                .findBookedByGuestEmailOrCustomerEmail(email.toLowerCase().trim(), LocalDateTime.now());

        if (appointments.isEmpty()) {
            return List.of();
        }

        // Collect unique business IDs — avoids N+1 on settings lookup
        Set<Long> businessIds = appointments.stream()
                .map(a -> a.getBusiness().getId())
                .collect(Collectors.toSet());

        // Single batch query for all relevant business settings
        Map<Long, Integer> cutoffByBusiness = businessSettingsRepository
                .findByBusinessIdIn(businessIds)
                .stream()
                .collect(Collectors.toMap(
                        s -> s.getBusiness().getId(),
                        BusinessSettings::getCancellationCutoffHours
                ));

        return appointments.stream()
                .map(a -> mapToGuestDTO(a, cutoffByBusiness))
                .collect(Collectors.toList());
    }

    // ─── Cancel ───────────────────────────────────────────────────────────────

    @Transactional
    public CancelConfirmationDTO cancelByEmail(UUID publicId, String email) {

        // 1. Find appointment
        Appointment appointment = appointmentRepository
                .findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // 2. Verify email ownership
        String apptEmail = resolveEmail(appointment);
        if (apptEmail == null || !apptEmail.equalsIgnoreCase(email.trim())) {
            throw new IllegalArgumentException("Email does not match this appointment");
        }

        // 3. Check still BOOKED
        if (appointment.getStatus() != Appointment.Status.BOOKED) {
            throw new IllegalArgumentException(
                    "This appointment is already " + appointment.getStatus().name().toLowerCase());
        }

        // 4. Check cancellation cutoff
        BusinessSettings settings = businessSettingsRepository
                .findByBusinessId(appointment.getBusiness().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Business settings not found"));

        LocalDateTime cutoff = appointment.getStartTime()
                .minusHours(settings.getCancellationCutoffHours());

        if (LocalDateTime.now().isAfter(cutoff)) {
            throw new IllegalArgumentException(
                    "Cancellation deadline passed. Please contact the business at "
                            + appointment.getBusiness().getPhone());
        }

        // 5. Cancel
        appointment.setStatus(Appointment.Status.CANCELLED);
        appointment.setCancelledBy(Appointment.CancelledBy.CUSTOMER);
        Appointment saved = appointmentRepository.save(appointment);

        // 6. Fire existing cancellation webhook — no new webhook needed
        webhookService.sendCancellationNotification(saved);

        return CancelConfirmationDTO.builder()
                .message("Your appointment has been successfully cancelled.")
                .businessName(saved.getBusiness().getName())
                .serviceName(saved.getService().getName())
                .startTime(saved.getStartTime().toString())
                .businessSlug(saved.getBusiness().getSlug())
                .build();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Maps one appointment to a guest DTO. Cutoff hours come from the pre-loaded
     * map — no additional DB calls inside this method.
     */
    private GuestAppointmentDTO mapToGuestDTO(Appointment a, Map<Long, Integer> cutoffByBusiness) {
        int cutoffHours = cutoffByBusiness.getOrDefault(a.getBusiness().getId(), 24);
        boolean canCancel = LocalDateTime.now().isBefore(
                a.getStartTime().minusHours(cutoffHours));

        return GuestAppointmentDTO.builder()
                .publicId(a.getPublicId().toString())
                .businessName(a.getBusiness().getName())
                .businessSlug(a.getBusiness().getSlug())
                .businessPhone(a.getBusiness().getPhone())
                .serviceName(a.getService().getName())
                .startTime(a.getStartTime().toString())
                .endTime(a.getEndTime().toString())
                .canCancel(canCancel)
                .build();
    }

    private String resolveEmail(Appointment appointment) {
        if (appointment.getGuestEmail() != null) {
            return appointment.getGuestEmail().toLowerCase();
        }
        if (appointment.getCustomer() != null && appointment.getCustomer().getAccount() != null) {
            return appointment.getCustomer().getAccount().getEmail().toLowerCase();
        }
        return null;
    }
}
