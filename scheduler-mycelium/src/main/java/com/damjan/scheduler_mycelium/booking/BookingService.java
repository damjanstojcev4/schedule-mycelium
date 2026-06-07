package com.damjan.scheduler_mycelium.booking;

import com.damjan.scheduler_mycelium.booking.dto.BusinessBookingPageResponseDTO;
import com.damjan.scheduler_mycelium.booking.dto.GuestBookAppointmentRequestDTO;
import com.damjan.scheduler_mycelium.domain.appointment.dto.AppointmentResponseDTO;
import com.damjan.scheduler_mycelium.domain.appointment.dto.AvailableSlotsResponseDTO;
import com.damjan.scheduler_mycelium.domain.appointment.AppointmentService;
import com.damjan.scheduler_mycelium.domain.business.Business;
import com.damjan.scheduler_mycelium.domain.business.BusinessService;
import com.damjan.scheduler_mycelium.domain.service.ServiceRepository;
import com.damjan.scheduler_mycelium.domain.service.ServiceService;
import com.damjan.scheduler_mycelium.domain.staff.StaffMember;
import com.damjan.scheduler_mycelium.domain.staff.StaffMemberRepository;
import com.damjan.scheduler_mycelium.domain.staff.StaffMemberService;
import com.damjan.scheduler_mycelium.exception.ResourceNotFoundException;
import com.damjan.scheduler_mycelium.scheduling.SlotAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class BookingService {

    private final BusinessService businessService;
    private final ServiceService serviceService;
    private final StaffMemberService staffMemberService;
    private final SlotAvailabilityService slotAvailabilityService;
    private final AppointmentService appointmentService;
    private final ServiceRepository serviceRepository;
    private final StaffMemberRepository staffMemberRepository;

    public BusinessBookingPageResponseDTO getBookingPage(String slug) {
        Business business = businessService.getBusinessEntityBySlug(slug);

        List<com.damjan.scheduler_mycelium.domain.service.dto.ServiceResponseDTO> services =
                serviceService.getActiveServices(business.getPublicId());

        List<com.damjan.scheduler_mycelium.domain.staff.dto.StaffResponseDTO> staff =
                Boolean.TRUE.equals(business.getSoloOperator())
                        ? Collections.emptyList()
                        : staffMemberService.getStaffByBusiness(business.getPublicId());

        return new BusinessBookingPageResponseDTO(
                business.getPublicId(),
                business.getSlug(),
                business.getName(),
                business.getDescription(),
                business.getCategory(),
                business.getPhone(),
                business.getAddress(),
                business.getSoloOperator(),
                services,
                staff
        );
    }

    public AvailableSlotsResponseDTO getAvailableSlots(
            String slug,
            UUID staffPublicId,
            UUID servicePublicId,
            LocalDate date
    ) {
        Business business = businessService.getBusinessEntityBySlug(slug);

        com.damjan.scheduler_mycelium.domain.service.Service service = serviceRepository.findByPublicId(servicePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (!service.getBusiness().getId().equals(business.getId())) {
            throw new IllegalArgumentException("Service does not belong to this business");
        }

        StaffMember staff = resolveStaff(business, staffPublicId);

        return slotAvailabilityService.getAvailableSlots(
                business.getId(),
                staff.getId(),
                service.getId(),
                date
        );
    }

    @Transactional
    public AppointmentResponseDTO bookGuestAppointment(String slug, GuestBookAppointmentRequestDTO request) {
        Business business = businessService.getBusinessEntityBySlug(slug);

        com.damjan.scheduler_mycelium.domain.service.Service service = serviceRepository.findByPublicId(request.getServicePublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        StaffMember staff = resolveStaff(business, request.getStaffPublicId());

        return appointmentService.bookGuestAppointment(
                business,
                service,
                staff,
                request.getStartTime(),
                request.getGuestName(),
                request.getGuestEmail(),
                request.getGuestPhone(),
                request.getNotes()
        );
    }

    private StaffMember resolveStaff(Business business, UUID staffPublicId) {
        if (Boolean.TRUE.equals(business.getSoloOperator())) {
            return staffMemberRepository.findByBusinessIdAndAccountId(business.getId(), business.getOwner().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Owner staff record not found for solo operator business"));
        }

        if (staffPublicId == null) {
            throw new IllegalArgumentException("staffPublicId is required for non-solo-operator businesses");
        }

        StaffMember staff = staffMemberRepository.findByPublicId(staffPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));

        if (!staff.getBusiness().getId().equals(business.getId())) {
            throw new IllegalArgumentException("Staff member does not belong to this business");
        }

        return staff;
    }
}
