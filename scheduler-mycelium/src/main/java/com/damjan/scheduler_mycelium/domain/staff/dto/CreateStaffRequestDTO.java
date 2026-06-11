package com.damjan.scheduler_mycelium.domain.staff.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateStaffRequestDTO {

    @NotBlank
    @Email
    private String email;

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
