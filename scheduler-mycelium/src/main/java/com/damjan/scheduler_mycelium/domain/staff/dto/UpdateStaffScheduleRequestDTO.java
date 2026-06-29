package com.damjan.scheduler_mycelium.domain.staff.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateStaffScheduleRequestDTO {
    @NotNull
    private List<StaffScheduleEntryDTO> schedule; // must contain all 7 days
}
