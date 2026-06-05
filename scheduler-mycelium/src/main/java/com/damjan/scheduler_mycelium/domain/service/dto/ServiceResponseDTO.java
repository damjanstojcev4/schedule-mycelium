package com.damjan.scheduler_mycelium.domain.service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponseDTO {

    private Long id;
    private String name;
    private String description;
    private Integer durationMinutes;
    private BigDecimal price;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
