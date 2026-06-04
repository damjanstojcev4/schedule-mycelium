package com.damjan.scheduler_mycelium.domain.business.dto;

public record BusinessSettingsResponseDTO(
        Long id,
        Long businessId,
        Integer cancellationCutoffHours,
        Integer slotIntervalMinutes
) {
}

