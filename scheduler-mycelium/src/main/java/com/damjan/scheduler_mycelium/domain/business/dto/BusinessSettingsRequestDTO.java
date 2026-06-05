package com.damjan.scheduler_mycelium.domain.business.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessSettingsRequestDTO {

    @NotNull
    private Integer cancellationCutoffHours;

    @NotNull
    private Integer slotIntervalMinutes;
}
