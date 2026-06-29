package com.damjan.scheduler_mycelium.domain.appointment;

import com.damjan.scheduler_mycelium.config.OpenApiConfig;
import com.damjan.scheduler_mycelium.domain.appointment.dto.AppointmentResponseDTO;
import com.damjan.scheduler_mycelium.domain.appointment.dto.OwnerBookAppointmentRequestDTO;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/businesses")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class OwnerBookingController {

    private final AppointmentService appointmentService;

    @PostMapping("/{slug}/owner-booking")
    public ResponseEntity<AppointmentResponseDTO> ownerBooking(
            @PathVariable String slug,
            @Valid @RequestBody OwnerBookAppointmentRequestDTO request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.createOwnerAppointment(slug, request, auth));
    }
}
