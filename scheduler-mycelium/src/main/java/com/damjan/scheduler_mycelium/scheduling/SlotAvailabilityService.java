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
import com.damjan.scheduler_mycelium.domain.staff.StaffSchedule;
import com.damjan.scheduler_mycelium.domain.staff.StaffScheduleRepository;
import com.damjan.scheduler_mycelium.domain.staff.StaffTimeBlock;
import com.damjan.scheduler_mycelium.domain.staff.StaffTimeBlockRepository;
import com.damjan.scheduler_mycelium.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;

import java.time.DayOfWeek;
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
    private final StaffScheduleRepository staffScheduleRepository;
    private final StaffTimeBlockRepository staffTimeBlockRepository;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public AvailableSlotsResponseDTO getAvailableSlots(UUID businessPublicId, UUID staffPublicId, UUID servicePublicId,
            LocalDate date) {
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

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
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
                    List.of(),
                    List.of());
        }

        if (staffDayOffRepository.existsByStaffMemberIdAndDayOff(staffId, date)) {
            return new AvailableSlotsResponseDTO(
                    staff.getBusiness().getPublicId(),
                    staff.getPublicId(),
                    service.getPublicId(),
                    date,
                    List.of(),
                    List.of());
        }

        BusinessSettings settings = businessSettingsRepository.findByBusinessId(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business settings not found"));

        DayOfWeek dayOfWeek = date.getDayOfWeek();
        java.util.Optional<StaffSchedule> scheduleOpt = staffScheduleRepository.findByStaffMemberIdAndDayOfWeek(staffId,
                dayOfWeek);
        if (scheduleOpt.isEmpty()) {
            return new AvailableSlotsResponseDTO(
                    staff.getBusiness().getPublicId(),
                    staff.getPublicId(),
                    service.getPublicId(),
                    date,
                    List.of(),
                    List.of());
        }

        StaffSchedule schedule = scheduleOpt.get();
        if (!schedule.getIsWorking()) {
            return new AvailableSlotsResponseDTO(
                    staff.getBusiness().getPublicId(),
                    staff.getPublicId(),
                    service.getPublicId(),
                    date,
                    List.of(),
                    List.of());
        }

        LocalTime workStart = schedule.getWorkStart();
        LocalTime workEnd = schedule.getWorkEnd();
        int durationMinutes = service.getDurationMinutes();
        int slotIntervalMinutes = settings.getSlotIntervalMinutes();

        // Fetch blocks scoped to the staff member. Also fetch all blocks for the
        // business
        // on this date as a cross-check — in case there is any staffId resolution
        // mismatch
        // between the schedule/admin page (which creates blocks) and the booking flow.
        List<StaffTimeBlock> timeBlocks = staffTimeBlockRepository.findByStaffMemberIdAndBlockDate(staffId, date);
        List<StaffTimeBlock> allBlocksForDate = staffTimeBlockRepository.findByBusinessIdAndBlockDate(
                staff.getBusiness().getId(), date);

        // Use the union so blocks are always respected regardless of ID resolution path
        java.util.Set<Long> seenIds = new java.util.HashSet<>();
        List<StaffTimeBlock> effectiveBlocks = new java.util.ArrayList<>();
        for (StaffTimeBlock b : timeBlocks) {
            if (seenIds.add(b.getId()))
                effectiveBlocks.add(b);
        }
        for (StaffTimeBlock b : allBlocksForDate) {
            if (seenIds.add(b.getId()))
                effectiveBlocks.add(b);
        }

        System.err.println("[SLOTS DEBUG] date=" + date + " staffId=" + staffId
                + " duration=" + durationMinutes + " interval=" + slotIntervalMinutes
                + " blocks-for-staff=" + timeBlocks.size()
                + " all-blocks-for-date=" + allBlocksForDate.size()
                + " effective=" + effectiveBlocks.size());
        effectiveBlocks.forEach(b -> System.err.println(
                "  [BLOCK] staffId=" + b.getStaffMember().getId() + " " + b.getStartTime() + " -> " + b.getEndTime()));

        List<LocalTime> availableSlots = new java.util.ArrayList<>();
        List<LocalTime> unavailableSlots = new java.util.ArrayList<>();
        LocalTime currentSlot = workStart;

        while (currentSlot.plusMinutes(durationMinutes).isBefore(workEnd)
                || currentSlot.plusMinutes(durationMinutes).equals(workEnd)) {
            LocalTime slotEnd = currentSlot.plusMinutes(durationMinutes);

            if (!schedule.isDuringBreak(currentSlot, slotEnd)) {
                LocalTime finalCurrentSlot = currentSlot;
                // A block overlaps if block.start < slotEnd AND block.end > slotStart
                List<StaffTimeBlock> overlappingBlocks = effectiveBlocks.stream()
                        .filter(block -> finalCurrentSlot.isBefore(block.getEndTime()) &&
                                slotEnd.isAfter(block.getStartTime()))
                        .toList();

                boolean blockedByOwner = !overlappingBlocks.isEmpty();

                System.err.println("[SLOTS DEBUG] checking " + currentSlot + " -> " + slotEnd + " blockedByOwner="
                        + blockedByOwner);

                if (blockedByOwner) {
                    // Jump past the END of the furthest overlapping block,
                    // then round up to the next interval boundary so the grid stays aligned.
                    LocalTime blockEnd = overlappingBlocks.stream()
                            .map(StaffTimeBlock::getEndTime)
                            .max(LocalTime::compareTo)
                            .orElse(currentSlot.plusMinutes(slotIntervalMinutes));

                    // Align blockEnd to the next interval boundary relative to workStart
                    long minutesFromStart = java.time.Duration.between(workStart, blockEnd).toMinutes();
                    long remainder = minutesFromStart % slotIntervalMinutes;
                    long alignedMinutes = remainder == 0 ? minutesFromStart
                            : minutesFromStart + (slotIntervalMinutes - remainder);
                    LocalTime nextSlot = workStart.plusMinutes(alignedMinutes);

                    // Every interval slot that was skipped over is unavailable
                    LocalTime skipped = currentSlot;
                    while (skipped.isBefore(nextSlot) &&
                            (skipped.plusMinutes(durationMinutes).isBefore(workEnd)
                                    || skipped.plusMinutes(durationMinutes).equals(workEnd))) {
                        unavailableSlots.add(skipped);
                        skipped = skipped.plusMinutes(slotIntervalMinutes);
                    }

                    currentSlot = nextSlot;
                    continue;
                }

                LocalDateTime startDateTime = LocalDateTime.of(date, currentSlot);
                LocalDateTime endDateTime = LocalDateTime.of(date, slotEnd);

                // Skip slots that are already in the past (today's date only)
                if (startDateTime.isBefore(LocalDateTime.now())) {
                    currentSlot = currentSlot.plusMinutes(slotIntervalMinutes);
                    continue;
                }

                if (!appointmentRepository.existsOverlappingAppointment(staffId, startDateTime, endDateTime)) {
                    availableSlots.add(currentSlot);
                    currentSlot = currentSlot.plusMinutes(durationMinutes);
                } else {
                    // Slot is within working hours but already booked
                    unavailableSlots.add(currentSlot);
                    currentSlot = currentSlot.plusMinutes(slotIntervalMinutes);
                }
            } else {
                currentSlot = currentSlot.plusMinutes(slotIntervalMinutes);
            }
        }

        return new AvailableSlotsResponseDTO(
                staff.getBusiness().getPublicId(),
                staff.getPublicId(),
                service.getPublicId(),
                date,
                availableSlots,
                unavailableSlots);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public boolean isSlotAvailable(Long staffId, LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime.isBefore(LocalDateTime.now())) {
            return false;
        }

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

        DayOfWeek dayOfWeek = date.getDayOfWeek();
        java.util.Optional<StaffSchedule> scheduleOpt = staffScheduleRepository.findByStaffMemberIdAndDayOfWeek(staffId,
                dayOfWeek);
        if (scheduleOpt.isEmpty() || !scheduleOpt.get().getIsWorking()) {
            return false;
        }

        StaffSchedule schedule = scheduleOpt.get();

        if (!schedule.isWithinWorkingHours(start, end)) {
            return false;
        }

        if (schedule.isDuringBreak(start, end)) {
            return false;
        }

        List<StaffTimeBlock> timeBlocks = staffTimeBlockRepository.findByStaffMemberIdAndBlockDate(staffId, date);
        boolean blockedByOwner = timeBlocks.stream().anyMatch(block -> start.isBefore(block.getEndTime()) &&
                end.isAfter(block.getStartTime()));

        if (blockedByOwner) {
            return false;
        }

        return !appointmentRepository.existsOverlappingAppointment(staffId, startTime, endTime);
    }
}
