package com.damjan.scheduler_mycelium.domain.business.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessClosureResponseDTO {

    private Long id;
    private LocalDate closureDate;
    private String reason;
}
