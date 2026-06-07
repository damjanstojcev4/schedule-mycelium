package com.damjan.scheduler_mycelium.domain.business.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessSettingsResponseDTO {

    private UUID businessPublicId;
    private Integer cancellationCutoffHours;
    private Integer slotIntervalMinutes;
}
