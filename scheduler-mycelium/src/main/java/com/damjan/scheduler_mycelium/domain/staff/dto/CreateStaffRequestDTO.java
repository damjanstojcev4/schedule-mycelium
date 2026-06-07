package com.damjan.scheduler_mycelium.domain.staff.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateStaffRequestDTO {

    @NotNull
    private UUID accountPublicId;

    @NotBlank
    private String name;

    @NotBlank
    private String roleTitle;

    @NotNull
    private LocalTime workStart;

    @NotNull
    private LocalTime workEnd;

    private LocalTime breakStart;
    private LocalTime breakEnd;
}
