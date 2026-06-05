package com.damjan.scheduler_mycelium.domain.staff.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffDayOffRequestDTO {

    @NotNull
    private LocalDate dayOff;
}
