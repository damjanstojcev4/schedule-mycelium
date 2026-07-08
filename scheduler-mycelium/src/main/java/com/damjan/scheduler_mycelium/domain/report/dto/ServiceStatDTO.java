package com.damjan.scheduler_mycelium.domain.report.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceStatDTO {
    private String serviceName;
    private int count;
    private double percentage;
}
