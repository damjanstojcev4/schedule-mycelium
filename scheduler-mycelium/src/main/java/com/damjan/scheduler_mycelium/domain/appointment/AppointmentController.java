package com.damjan.scheduler_mycelium.domain.appointment;

import com.damjan.scheduler_mycelium.config.OpenApiConfig;
import com.damjan.scheduler_mycelium.domain.appointment.dto.AppointmentResponseDTO;
import com.damjan.scheduler_mycelium.domain.appointment.dto.BookAppointmentRequestDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Appointments", description = "Book and manage appointments. All endpoints require JWT.")
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class AppointmentController {

    private final AppointmentService appointmentService;

    @Operation(
            summary = "Book an appointment",
            description = "CUSTOMER role. `startTime` must match an available slot from GET /api/slots."
    )
    @ApiResponse(responseCode = "201", content = @Content(schema = @Schema(implementation = AppointmentResponseDTO.class)))
    @ApiResponse(responseCode = "409", description = "Slot no longer available")
    @PostMapping
    public ResponseEntity<AppointmentResponseDTO> bookAppointment(
            @Valid @RequestBody BookAppointmentRequestDTO request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.bookAppointment(request, auth));
    }

    @Operation(summary = "List my appointments", description = "Returns appointments visible to the current user (customer, staff, or owner).")
    @ApiResponse(responseCode = "200",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = AppointmentResponseDTO.class))))
    @GetMapping("/my")
    public ResponseEntity<List<AppointmentResponseDTO>> getMyAppointments(Authentication auth) {
        return ResponseEntity.ok(appointmentService.getMyAppointments(auth));
    }

    @Operation(summary = "Get appointment by public ID")
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = AppointmentResponseDTO.class)))
    @ApiResponse(responseCode = "403", description = "Not allowed to view this appointment")
    @GetMapping("/{publicId}")
    public ResponseEntity<AppointmentResponseDTO> getAppointmentByPublicId(
            @Parameter(description = "Appointment public ID") @PathVariable UUID publicId,
            Authentication auth) {
        return ResponseEntity.ok(appointmentService.getAppointmentByPublicId(publicId, auth));
    }

    @Operation(summary = "Cancel appointment", description = "Customer, assigned staff, or business owner may cancel.")
    @ApiResponse(responseCode = "200", description = "Cancelled")
    @PatchMapping("/{publicId}/cancel")
    public ResponseEntity<Void> cancelAppointment(@PathVariable UUID publicId, Authentication auth) {
        appointmentService.cancelAppointment(publicId, auth);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Complete appointment", description = "Staff or business owner marks appointment as completed.")
    @ApiResponse(responseCode = "200", description = "Completed")
    @PatchMapping("/{publicId}/complete")
    public ResponseEntity<Void> completeAppointment(@PathVariable UUID publicId, Authentication auth) {
        appointmentService.completeAppointment(publicId, auth);
        return ResponseEntity.ok().build();
    }
}
