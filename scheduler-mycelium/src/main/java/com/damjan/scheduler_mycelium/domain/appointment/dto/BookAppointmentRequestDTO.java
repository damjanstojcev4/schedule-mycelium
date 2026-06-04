package com.damjan.scheduler_mycelium.domain.appointment.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record BookAppointmentRequestDTO(
        @NotNull Long serviceId,
        @NotNull Long staffMemberId,
        @NotNull LocalDateTime startTime,
        String notes
) {
}

