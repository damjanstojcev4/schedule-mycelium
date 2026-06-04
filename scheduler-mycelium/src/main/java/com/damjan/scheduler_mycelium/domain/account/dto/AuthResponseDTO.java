package com.damjan.scheduler_mycelium.domain.account.dto;

public record AuthResponseDTO(
        String token,
        Long accountId,
        String email,
        String role
) {
}

