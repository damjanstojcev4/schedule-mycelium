package com.damjan.scheduler_mycelium.domain.business.dto;

import java.time.LocalDate;

public record BusinessClosureResponseDTO(
        Long id,
        LocalDate closureDate,
        String reason
) {
}

