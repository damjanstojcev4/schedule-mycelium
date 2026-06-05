package com.damjan.scheduler_mycelium.domain.appointment.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookAppointmentRequestDTO {

    @NotNull
    private Long serviceId;

    @NotNull
    private Long staffMemberId;

    @NotNull
    private LocalDateTime startTime;

    private String notes;
}
