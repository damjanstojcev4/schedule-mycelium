package com.damjan.scheduler_mycelium.domain.staff.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;

public record StaffResponseDTO(
        Long id,
        String name,
        String roleTitle,
        LocalTime workStart,
        LocalTime workEnd,
        LocalTime breakStart,
        LocalTime breakEnd,
        LocalDateTime createdAt
) {
}

