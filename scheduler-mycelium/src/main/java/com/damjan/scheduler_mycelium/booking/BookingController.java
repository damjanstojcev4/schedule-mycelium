package com.damjan.scheduler_mycelium.booking;

import com.damjan.scheduler_mycelium.booking.dto.BusinessBookingPageResponseDTO;
import com.damjan.scheduler_mycelium.booking.dto.GuestBookAppointmentRequestDTO;
import com.damjan.scheduler_mycelium.domain.appointment.dto.AppointmentResponseDTO;
import com.damjan.scheduler_mycelium.domain.appointment.dto.AvailableSlotsResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@Tag(name = "Public Booking", description = "Public booking endpoints — no authentication required.")
@RestController
@RequestMapping("/api/book")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @Operation(summary = "Get business booking page", description = "Returns business info, active services, and staff (empty if solo operator).")
    @SecurityRequirements
    @GetMapping("/{slug}")
    public ResponseEntity<BusinessBookingPageResponseDTO> getBookingPage(@PathVariable String slug) {
        return ResponseEntity.ok(bookingService.getBookingPage(slug));
    }

    @Operation(summary = "Get available slots", description = "staffPublicId is optional for solo-operator businesses.")
    @SecurityRequirements
    @GetMapping("/{slug}/slots")
    public ResponseEntity<AvailableSlotsResponseDTO> getAvailableSlots(
            @PathVariable String slug,
            @RequestParam(required = false) UUID staffPublicId,
            @RequestParam UUID servicePublicId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(bookingService.getAvailableSlots(slug, staffPublicId, servicePublicId, date));
    }

    @Operation(summary = "Book appointment as guest", description = "Creates a guest appointment without requiring authentication.")
    @SecurityRequirements
    @PostMapping("/{slug}/appointments")
    public ResponseEntity<AppointmentResponseDTO> bookGuestAppointment(
            @PathVariable String slug,
            @Valid @RequestBody GuestBookAppointmentRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.bookGuestAppointment(slug, request));
    }
}
