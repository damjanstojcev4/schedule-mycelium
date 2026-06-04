package com.damjan.scheduler_mycelium.domain.appointment.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record AvailableSlotsResponseDTO(
        LocalDate date,
        Long staffId,
        List<LocalTime> availableSlots
) {
}
