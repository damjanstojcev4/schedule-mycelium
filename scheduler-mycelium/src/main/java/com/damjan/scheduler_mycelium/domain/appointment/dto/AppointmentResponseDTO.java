package com.damjan.scheduler_mycelium.domain.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDTO {

    private UUID publicId;
    private UUID businessPublicId;
    private String staffName;
    private String customerName;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String serviceName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String cancelledBy;
    private String notes;
    private LocalDateTime createdAt;
    private String businessName;
    private String businessSlug;
}
