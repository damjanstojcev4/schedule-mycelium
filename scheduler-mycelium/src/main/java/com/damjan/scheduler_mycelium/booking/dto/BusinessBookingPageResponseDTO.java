package com.damjan.scheduler_mycelium.booking.dto;

import com.damjan.scheduler_mycelium.domain.service.dto.ServiceResponseDTO;
import com.damjan.scheduler_mycelium.domain.staff.dto.StaffResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessBookingPageResponseDTO {

    private UUID publicId;
    private String slug;
    private String name;
    private String description;
    private String category;
    private String phone;
    private String address;
    private Boolean soloOperator;
    private List<ServiceResponseDTO> services;
    private List<StaffResponseDTO> staff;
}
