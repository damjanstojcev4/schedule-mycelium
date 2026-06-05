package com.damjan.scheduler_mycelium.domain.business.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessResponseDTO {

    private Long id;
    private String name;
    private String category;
    private String phone;
    private String address;
    private String description;
    private LocalDateTime createdAt;
}
