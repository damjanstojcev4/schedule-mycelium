package com.damjan.scheduler_mycelium.domain.staff.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffDayOffResponseDTO {

    private Long id;
    private UUID staffPublicId;
    private LocalDate dayOff;
}
