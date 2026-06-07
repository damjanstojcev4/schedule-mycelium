package com.damjan.scheduler_mycelium.domain.appointment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookAppointmentRequestDTO {

    @NotNull
    private UUID servicePublicId;

    @NotNull
    private UUID staffPublicId;

    @NotNull
    private LocalDateTime startTime;

    private String notes;
}
