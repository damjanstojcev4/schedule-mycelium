package com.damjan.scheduler_mycelium.domain.business.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessClosureRequestDTO {

    @NotNull
    private LocalDate closureDate;

    @NotBlank
    private String reason;
}
