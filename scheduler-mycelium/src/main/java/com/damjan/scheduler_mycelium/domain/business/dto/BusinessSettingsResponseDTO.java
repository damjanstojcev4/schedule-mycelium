package com.damjan.scheduler_mycelium.domain.business.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessSettingsResponseDTO {

    private Long id;
    private Long businessId;
    private Integer cancellationCutoffHours;
    private Integer slotIntervalMinutes;
}
