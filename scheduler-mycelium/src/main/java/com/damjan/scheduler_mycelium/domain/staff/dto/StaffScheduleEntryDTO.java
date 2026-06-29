package com.damjan.scheduler_mycelium.domain.staff.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StaffScheduleEntryDTO {
    private String dayOfWeek;       // "MONDAY" etc.
    private Boolean isWorking;
    private String workStart;       // "09:00"
    private String workEnd;         // "18:00"
    private String breakStart;      // nullable
    private String breakEnd;        // nullable
}
