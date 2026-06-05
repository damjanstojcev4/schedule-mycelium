package com.damjan.scheduler_mycelium.domain.appointment.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotsResponseDTO {

    private Long businessId;
    private Long staffId;
    private Long serviceId;
    private LocalDate date;
    private List<LocalTime> availableSlots;
}
