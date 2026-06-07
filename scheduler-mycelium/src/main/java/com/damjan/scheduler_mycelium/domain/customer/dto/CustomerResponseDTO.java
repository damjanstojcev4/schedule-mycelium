package com.damjan.scheduler_mycelium.domain.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponseDTO {

    private UUID publicId;
    private String fullName;
    private String phone;
    private LocalDateTime createdAt;
}
