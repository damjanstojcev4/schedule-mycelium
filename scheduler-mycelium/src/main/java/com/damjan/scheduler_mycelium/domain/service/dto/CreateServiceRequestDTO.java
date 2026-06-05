package com.damjan.scheduler_mycelium.domain.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceRequestDTO {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Positive
    private Integer durationMinutes;

    @NotNull
    @Positive
    private BigDecimal price;
}
