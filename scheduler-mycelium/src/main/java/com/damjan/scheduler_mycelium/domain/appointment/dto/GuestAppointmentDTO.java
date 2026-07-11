package com.damjan.scheduler_mycelium.domain.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestAppointmentDTO {
    private String publicId;
    private String businessName;
    private String businessSlug;
    private String businessPhone;
    private String serviceName;
    private String startTime;
    private String endTime;
    private boolean canCancel;
}
