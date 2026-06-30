package com.damjan.scheduler_mycelium.domain.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotsResponseDTO {

    private UUID businessPublicId;
    private UUID staffPublicId;
    private UUID servicePublicId;
    private LocalDate date;
    private List<LocalTime> availableSlots;
    /** Slots that are within working hours but unavailable (blocked by admin or already booked). */
    private List<LocalTime> unavailableSlots;
}
