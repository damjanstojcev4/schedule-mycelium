package com.damjan.scheduler_mycelium.domain.staff.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record StaffDayOffRequestDTO(
        @NotNull LocalDate dayOff
) {
}

