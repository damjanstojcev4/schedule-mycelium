package com.damjan.scheduler_mycelium.domain.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CreateServiceRequestDTO(
        @NotBlank String name,
        String description,
        @NotNull @Positive Integer durationMinutes,
        @NotNull @Positive BigDecimal price
) {
}

