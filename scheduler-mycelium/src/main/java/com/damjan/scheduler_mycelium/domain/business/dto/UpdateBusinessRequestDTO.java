package com.damjan.scheduler_mycelium.domain.business.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBusinessRequestDTO {
    private String name;
    private String category;
    private String phone;
    private String address;
    private String description;
    private Boolean soloOperator;
}
