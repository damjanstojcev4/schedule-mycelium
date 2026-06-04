package com.damjan.scheduler_mycelium.domain.customer.dto;

import java.time.LocalDateTime;

public record CustomerResponseDTO(
        Long id,
        String fullName,
        String phone,
        LocalDateTime createdAt
) {
}

