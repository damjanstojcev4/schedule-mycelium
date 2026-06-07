package com.damjan.scheduler_mycelium.domain.business.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBusinessRequestDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String category;

    @NotBlank
    private String phone;

    @NotBlank
    private String address;

    private String description;

    private Boolean soloOperator = true;
}
