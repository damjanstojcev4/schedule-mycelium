package com.damjan.scheduler_mycelium.domain.appointment.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDTO {

    private Long id;
    private Long businessId;
    private String staffName;
    private String customerName;
    private String serviceName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String cancelledBy;
    private String notes;
    private LocalDateTime createdAt;
}
