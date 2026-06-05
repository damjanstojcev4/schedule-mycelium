package com.damjan.scheduler_mycelium.domain.staff.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateStaffRequestDTO {

    @NotNull
    private Long accountId;

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
