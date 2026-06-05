package com.damjan.scheduler_mycelium.domain.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCustomerRequestDTO {

    private String fullName;
    private String phone;
}
