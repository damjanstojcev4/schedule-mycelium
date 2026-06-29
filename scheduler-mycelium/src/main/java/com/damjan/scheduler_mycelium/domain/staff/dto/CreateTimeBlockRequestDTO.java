package com.damjan.scheduler_mycelium.domain.staff.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data @NoArgsConstructor @AllArgsConstructor
public class CreateTimeBlockRequestDTO {
    @NotNull
    private LocalDate blockDate;
    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime endTime;
    private String reason;
}
