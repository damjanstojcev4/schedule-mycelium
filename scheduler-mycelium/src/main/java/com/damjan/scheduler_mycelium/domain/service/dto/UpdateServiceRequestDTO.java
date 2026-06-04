package com.damjan.scheduler_mycelium.domain.service.dto;

import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record UpdateServiceRequestDTO(
        String name,
        String description,
        @Positive Integer durationMinutes,
        @Positive BigDecimal price
) {
}

