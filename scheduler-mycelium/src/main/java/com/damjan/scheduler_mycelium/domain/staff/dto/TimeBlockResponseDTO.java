package com.damjan.scheduler_mycelium.domain.staff.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TimeBlockResponseDTO {
    private String publicId;
    private LocalDate blockDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String reason;
    private LocalDateTime createdAt;
}
