package com.damjan.scheduler_mycelium.booking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuestBookAppointmentRequestDTO {

    @NotNull
    private UUID servicePublicId;

    private UUID staffPublicId;

    @NotNull
    private LocalDateTime startTime;

    @NotBlank
    private String guestName;

    @NotBlank
    @Email
    private String guestEmail;

    @NotBlank
    private String guestPhone;

    private String notes;
}
