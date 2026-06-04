package com.damjan.scheduler_mycelium.domain.business.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record BusinessClosureRequestDTO(
        @NotNull LocalDate closureDate,
        @NotBlank String reason
) {
}

