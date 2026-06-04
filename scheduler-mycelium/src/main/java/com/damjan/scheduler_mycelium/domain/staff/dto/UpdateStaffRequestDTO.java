package com.damjan.scheduler_mycelium.domain.staff.dto;

import java.time.LocalTime;

public record UpdateStaffRequestDTO(
        Long accountId,
        String name,
        String roleTitle,
        LocalTime workStart,
        LocalTime workEnd,
        LocalTime breakStart,
        LocalTime breakEnd
) {
}

