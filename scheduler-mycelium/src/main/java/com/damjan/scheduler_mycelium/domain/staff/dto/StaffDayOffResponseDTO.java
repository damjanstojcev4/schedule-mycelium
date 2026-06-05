package com.damjan.scheduler_mycelium.domain.staff.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffDayOffResponseDTO {

    private Long id;
    private Long staffMemberId;
    private LocalDate dayOff;
}
