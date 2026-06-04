package com.damjan.scheduler_mycelium.domain.staff.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record CreateStaffRequestDTO(
        @NotNull Long accountId,
        @NotBlank String name,
        @NotBlank String roleTitle,
        @NotNull LocalTime workStart,
        @NotNull LocalTime workEnd,
        LocalTime breakStart,
        LocalTime breakEnd
) {
}

