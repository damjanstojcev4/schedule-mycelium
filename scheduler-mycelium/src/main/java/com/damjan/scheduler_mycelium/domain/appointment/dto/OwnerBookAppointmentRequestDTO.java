package com.damjan.scheduler_mycelium.domain.appointment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor
public class OwnerBookAppointmentRequestDTO {
    @NotNull
    private UUID servicePublicId;
    
    private UUID staffPublicId;        // nullable if soloOperator
    
    @NotNull
    private LocalDateTime startTime;
    
    @NotBlank
    private String customerName;       // required — walk-in name
    
    private String customerEmail;      // optional — send confirmation if provided
    
    private String customerPhone;      // optional
    
    private String notes;
}
