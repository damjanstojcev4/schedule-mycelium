package com.damjan.scheduler_mycelium.public_cancel;

import com.damjan.scheduler_mycelium.domain.appointment.dto.CancelByEmailRequestDTO;
import com.damjan.scheduler_mycelium.domain.appointment.dto.CancelConfirmationDTO;
import com.damjan.scheduler_mycelium.domain.appointment.dto.GuestAppointmentDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Fully public — no JWT ever. Accessible at /api/public/appointments.
 * Security is by email+publicId combination: caller must know both.
 */
@RestController
@RequestMapping("/api/public/appointments")
@RequiredArgsConstructor
public class PublicCancellationController {

    private final PublicCancellationService publicCancellationService;

    /**
     * Fetch upcoming BOOKED appointments for a given guest email.
     * GET /api/public/appointments?email=john@example.com
     */
    @GetMapping
    public ResponseEntity<List<GuestAppointmentDTO>> getByEmail(
            @RequestParam String email) {
        return ResponseEntity.ok(
                publicCancellationService.getBookedAppointmentsByEmail(email));
    }

    /**
     * Cancel a specific appointment — verifies email ownership before cancelling.
     * POST /api/public/appointments/{publicId}/cancel
     * Body: { "email": "john@example.com" }
     */
    @PostMapping("/{publicId}/cancel")
    public ResponseEntity<CancelConfirmationDTO> cancelByEmail(
            @PathVariable UUID publicId,
            @RequestBody @Valid CancelByEmailRequestDTO request) {
        return ResponseEntity.ok(
                publicCancellationService.cancelByEmail(publicId, request.getEmail()));
    }
}
