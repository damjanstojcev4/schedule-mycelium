package com.damjan.scheduler_mycelium.domain.staff.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StaffScheduleResponseDTO {
    private String staffPublicId;
    private String staffName;
    private List<StaffScheduleEntryDTO> schedule; // 7 entries, one per day
}
