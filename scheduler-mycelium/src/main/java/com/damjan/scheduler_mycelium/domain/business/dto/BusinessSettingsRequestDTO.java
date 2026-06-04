package com.damjan.scheduler_mycelium.domain.business.dto;

import jakarta.validation.constraints.NotNull;

public record BusinessSettingsRequestDTO(
        @NotNull Integer cancellationCutoffHours,
        @NotNull Integer slotIntervalMinutes
) {
}

