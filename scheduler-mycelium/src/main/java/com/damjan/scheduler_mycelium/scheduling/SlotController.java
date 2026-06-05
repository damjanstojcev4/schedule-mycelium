package com.damjan.scheduler_mycelium.scheduling;

import com.damjan.scheduler_mycelium.domain.appointment.dto.AvailableSlotsResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Tag(name = "Slots", description = "Public availability lookup before booking an appointment.")
@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
@SecurityRequirements
public class SlotController {

    private final SlotAvailabilityService slotAvailabilityService;

    @Operation(
            summary = "Get available time slots",
            description = "Returns bookable start times for a given business, staff member, service, and date. "
                    + "Respects business hours, closures, staff days off, and existing appointments."
    )
    @ApiResponse(responseCode = "200", description = "Available slots",
            content = @Content(schema = @Schema(implementation = AvailableSlotsResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Business, staff, or service not found")
    @GetMapping
    public ResponseEntity<AvailableSlotsResponseDTO> getAvailableSlots(
            @Parameter(description = "Business ID", required = true) @RequestParam Long businessId,
            @Parameter(description = "Staff member ID", required = true) @RequestParam Long staffId,
            @Parameter(description = "Service ID (defines duration)", required = true) @RequestParam Long serviceId,
            @Parameter(description = "Date to check (ISO-8601, e.g. 2026-06-04)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(slotAvailabilityService.getAvailableSlots(businessId, staffId, serviceId, date));
    }
}
