package com.damjan.scheduler_mycelium.domain.business.dto;

import java.time.LocalDateTime;

public record BusinessResponseDTO(
        Long id,
        String name,
        String category,
        String phone,
        String address,
        String description,
        LocalDateTime createdAt
) {
}

