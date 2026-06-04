package com.damjan.scheduler_mycelium.domain.service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ServiceResponseDTO(
        Long id,
        String name,
        String description,
        Integer durationMinutes,
        BigDecimal price,
        Boolean isActive,
        LocalDateTime createdAt
) {
}

