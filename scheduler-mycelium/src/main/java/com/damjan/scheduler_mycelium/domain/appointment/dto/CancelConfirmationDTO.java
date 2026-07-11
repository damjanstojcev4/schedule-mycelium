package com.damjan.scheduler_mycelium.domain.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelConfirmationDTO {
    private String message;
    private String businessName;
    private String serviceName;
    private String startTime;
    private String businessSlug;
}
