package com.damjan.scheduler_mycelium.scheduling;

import com.damjan.scheduler_mycelium.domain.appointment.AppointmentRepository;
import com.damjan.scheduler_mycelium.domain.appointment.dto.AvailableSlotsResponseDTO;
import com.damjan.scheduler_mycelium.domain.business.BusinessClosureRepository;
import com.damjan.scheduler_mycelium.domain.business.BusinessSettings;
import com.damjan.scheduler_mycelium.domain.business.BusinessSettingsRepository;
import com.damjan.scheduler_mycelium.domain.service.Service;
import com.damjan.scheduler_mycelium.domain.service.ServiceRepository;
import com.damjan.scheduler_mycelium.domain.staff.StaffDayOffRepository;
import com.damjan.scheduler_mycelium.domain.staff.StaffMember;
import com.damjan.scheduler_mycelium.domain.staff.StaffMemberRepository;
import com.damjan.scheduler_mycelium.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class SlotAvailabilityService {

    private final BusinessClosureRepository businessClosureRepository;
    private final StaffDayOffRepository staffDayOffRepository;
    private final AppointmentRepository appointmentRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final BusinessSettingsRepository businessSettingsRepository;
    private final ServiceRepository serviceRepository;

    public AvailableSlotsResponseDTO getAvailableSlots(UUID businessPublicId, UUID staffPublicId, UUID servicePublicId, LocalDate date) {
        StaffMember staff = staffMemberRepository.findByPublicId(staffPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        Service service = serviceRepository.findByPublicId(servicePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (!staff.getBusiness().getPublicId().equals(businessPublicId)) {
            throw new IllegalArgumentException("Staff member does not belong to this business");
        }

        if (!service.getBusiness().getPublicId().equals(businessPublicId)) {
            throw new IllegalArgumentException("Service does not belong to this business");
        }

        return getAvailableSlots(staff.getBusiness().getId(), staff.getId(), service.getId(), date);
    }

    public AvailableSlotsResponseDTO getAvailableSlots(Long businessId, Long staffId, Long serviceId, LocalDate date) {
        StaffMember staff = staffMemberRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (businessClosureRepository.existsByBusinessIdAndClosureDate(businessId, date)) {
            return new AvailableSlotsResponseDTO(
                    staff.getBusiness().getPublicId(),
                    staff.getPublicId(),
                    service.getPublicId(),
                    date,
                    List.of()
            );
        }

        if (staffDayOffRepository.existsByStaffMemberIdAndDayOff(staffId, date)) {
            return new AvailableSlotsResponseDTO(
                    staff.getBusiness().getPublicId(),
                    staff.getPublicId(),
                    service.getPublicId(),
                    date,
                    List.of()
            );
        }

        BusinessSettings settings = businessSettingsRepository.findByBusinessId(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business settings not found"));

        LocalTime workStart = staff.getWorkStart();
        LocalTime workEnd = staff.getWorkEnd();
        int durationMinutes = service.getDurationMinutes();
        int slotIntervalMinutes = settings.getSlotIntervalMinutes();

        List<LocalTime> availableSlots = new ArrayList<>();
        LocalTime currentSlot = workStart;

        while (currentSlot.plusMinutes(durationMinutes).isBefore(workEnd) || currentSlot.plusMinutes(durationMinutes).equals(workEnd)) {
            LocalTime slotEnd = currentSlot.plusMinutes(durationMinutes);

            if (!staff.isDuringBreak(currentSlot, slotEnd)) {
                LocalDateTime startDateTime = LocalDateTime.of(date, currentSlot);
                LocalDateTime endDateTime = LocalDateTime.of(date, slotEnd);

                if (!appointmentRepository.existsOverlappingAppointment(staffId, startDateTime, endDateTime)) {
                    availableSlots.add(currentSlot);
                }
            }
            currentSlot = currentSlot.plusMinutes(durationMinutes);
        }

        return new AvailableSlotsResponseDTO(
                staff.getBusiness().getPublicId(),
                staff.getPublicId(),
                service.getPublicId(),
                date,
                availableSlots
        );
    }

    public boolean isSlotAvailable(Long staffId, LocalDateTime startTime, LocalDateTime endTime) {
        StaffMember staff = staffMemberRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        LocalDate date = startTime.toLocalDate();
        Long businessId = staff.getBusiness().getId();

        if (businessClosureRepository.existsByBusinessIdAndClosureDate(businessId, date)) {
            return false;
        }

        if (staffDayOffRepository.existsByStaffMemberIdAndDayOff(staffId, date)) {
            return false;
        }

        LocalTime start = startTime.toLocalTime();
        LocalTime end = endTime.toLocalTime();

        if (!staff.isWithinWorkingHours(start, end)) {
            return false;
        }

        if (staff.isDuringBreak(start, end)) {
            return false;
        }

        return !appointmentRepository.existsOverlappingAppointment(staffId, startTime, endTime);
    }
}
