package com.damjan.scheduler_mycelium.domain.service.dto;

import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateServiceRequestDTO {

    private String name;
    private String description;

    @Positive
    private Integer durationMinutes;

    @Positive
    private BigDecimal price;
}
