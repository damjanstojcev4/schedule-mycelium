package com.damjan.scheduler_mycelium.domain.business.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessResponseDTO {

    private UUID publicId;
    private String slug;
    private String name;
    private String category;
    private String phone;
    private String address;
    private String description;
    private Boolean soloOperator;
    private LocalDateTime createdAt;
}
