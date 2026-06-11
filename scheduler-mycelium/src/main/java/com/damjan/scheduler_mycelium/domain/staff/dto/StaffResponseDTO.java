package com.damjan.scheduler_mycelium.domain.staff.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponseDTO {

    private UUID publicId;
    private UUID accountPublicId;
    private String email;
    private String name;
    private String roleTitle;
    private LocalTime workStart;
    private LocalTime workEnd;
    private LocalTime breakStart;
    private LocalTime breakEnd;
    private LocalDateTime createdAt;
    /** Non-null only when this call auto-created a new account. Show once and store safely. */
    private String tempPassword;
}
