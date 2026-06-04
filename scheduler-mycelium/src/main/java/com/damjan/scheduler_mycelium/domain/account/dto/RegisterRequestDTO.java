package com.damjan.scheduler_mycelium.domain.account.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequestDTO(
        @NotBlank @Email String email,
        @NotBlank String password,
        @NotBlank String role
) {
}

