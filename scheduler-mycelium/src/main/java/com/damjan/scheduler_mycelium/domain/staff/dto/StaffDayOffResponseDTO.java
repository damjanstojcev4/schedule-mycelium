package com.damjan.scheduler_mycelium.domain.staff.dto;

import java.time.LocalDate;

public record StaffDayOffResponseDTO(
        Long id,
        LocalDate dayOff
) {
}

