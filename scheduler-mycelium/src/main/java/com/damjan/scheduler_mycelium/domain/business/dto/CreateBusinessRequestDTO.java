package com.damjan.scheduler_mycelium.domain.business.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateBusinessRequestDTO(
        @NotBlank String name,
        @NotBlank String category,
        @NotBlank String phone,
        @NotBlank String address,
        String description
) {
}

