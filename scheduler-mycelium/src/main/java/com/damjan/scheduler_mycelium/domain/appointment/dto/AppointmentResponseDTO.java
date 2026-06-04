package com.damjan.scheduler_mycelium.domain.appointment.dto;

import java.time.LocalDateTime;

public record AppointmentResponseDTO(
        Long id,
        Long businessId,
        String staffName,
        String customerName,
        String serviceName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String status,
        String cancelledBy,
        String notes,
        LocalDateTime createdAt
) {
}

