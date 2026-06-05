package com.damjan.scheduler_mycelium.domain.account.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;
    private Long accountId;
    private String email;
    private String role;
}
