package com.damjan.scheduler_mycelium.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminAccountResponseDTO {

    private UUID publicId;
    private String email;
    private String role;
    private LocalDateTime createdAt;
}
