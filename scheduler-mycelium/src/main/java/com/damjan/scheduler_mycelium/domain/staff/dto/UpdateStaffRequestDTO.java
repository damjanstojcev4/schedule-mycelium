package com.damjan.scheduler_mycelium.domain.staff.dto;

import java.time.LocalTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStaffRequestDTO {

    private UUID accountPublicId;
    private String name;
    private String roleTitle;
    private LocalTime workStart;
    private LocalTime workEnd;
    private LocalTime breakStart;
    private LocalTime breakEnd;
}
