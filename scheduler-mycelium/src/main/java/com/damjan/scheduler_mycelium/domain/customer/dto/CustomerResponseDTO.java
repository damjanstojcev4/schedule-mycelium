package com.damjan.scheduler_mycelium.domain.customer.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponseDTO {

    private Long id;
    private String fullName;
    private String phone;
    private LocalDateTime createdAt;
}
