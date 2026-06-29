package com.damjan.scheduler_mycelium.domain.staff;

import com.damjan.scheduler_mycelium.domain.staff.dto.StaffScheduleEntryDTO;
import com.damjan.scheduler_mycelium.domain.staff.dto.StaffScheduleResponseDTO;
import com.damjan.scheduler_mycelium.domain.staff.dto.UpdateStaffScheduleRequestDTO;
import com.damjan.scheduler_mycelium.security.TenantGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StaffScheduleService {

    private final StaffScheduleRepository staffScheduleRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final TenantGuard tenantGuard;

    @Transactional(readOnly = true)
    public StaffScheduleResponseDTO getSchedule(UUID businessPublicId, UUID staffPublicId, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);
        tenantGuard.assertStaffBelongsToBusiness(staffPublicId, businessPublicId, auth);

        StaffMember staffMember = staffMemberRepository.findByPublicId(staffPublicId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        List<StaffSchedule> schedules = staffScheduleRepository.findByStaffMemberIdOrderByDayOfWeek(staffMember.getId());
        
        List<StaffScheduleEntryDTO> entries = new ArrayList<>();
        // Make sure we return exactly 7 days
        for (DayOfWeek day : DayOfWeek.values()) {
            StaffSchedule schedule = schedules.stream()
                    .filter(s -> s.getDayOfWeek() == day)
                    .findFirst()
                    .orElse(null);

            if (schedule != null) {
                entries.add(mapToDTO(schedule));
            } else {
                entries.add(StaffScheduleEntryDTO.builder()
                        .dayOfWeek(day.name())
                        .isWorking(false)
                        .build());
            }
        }

        return StaffScheduleResponseDTO.builder()
                .staffPublicId(staffMember.getPublicId().toString())
                .staffName(staffMember.getName())
                .schedule(entries)
                .build();
    }

    @Transactional
    public StaffScheduleResponseDTO updateSchedule(UUID businessPublicId, UUID staffPublicId, UpdateStaffScheduleRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);
        tenantGuard.assertStaffBelongsToBusiness(staffPublicId, businessPublicId, auth);

        StaffMember staffMember = staffMemberRepository.findByPublicId(staffPublicId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        if (request.getSchedule() == null || request.getSchedule().size() != 7) {
            throw new IllegalArgumentException("Schedule must contain exactly 7 days");
        }

        for (StaffScheduleEntryDTO entryDTO : request.getSchedule()) {
            DayOfWeek day = DayOfWeek.valueOf(entryDTO.getDayOfWeek());
            
            if (Boolean.TRUE.equals(entryDTO.getIsWorking())) {
                if (entryDTO.getWorkStart() == null || entryDTO.getWorkEnd() == null) {
                    throw new IllegalArgumentException("Working days must have start and end times");
                }
                LocalTime start = LocalTime.parse(entryDTO.getWorkStart());
                LocalTime end = LocalTime.parse(entryDTO.getWorkEnd());
                if (!start.isBefore(end)) {
                    throw new IllegalArgumentException("Work start must be before work end");
                }
                if (entryDTO.getBreakStart() != null && entryDTO.getBreakEnd() != null) {
                    LocalTime breakStart = LocalTime.parse(entryDTO.getBreakStart());
                    LocalTime breakEnd = LocalTime.parse(entryDTO.getBreakEnd());
                    if (!breakStart.isBefore(breakEnd)) {
                        throw new IllegalArgumentException("Break start must be before break end");
                    }
                    if (breakStart.isBefore(start) || breakEnd.isAfter(end)) {
                        throw new IllegalArgumentException("Break must be within working hours");
                    }
                }
            }

            StaffSchedule schedule = staffScheduleRepository.findByStaffMemberIdAndDayOfWeek(staffMember.getId(), day)
                    .orElseGet(() -> {
                        StaffSchedule s = new StaffSchedule();
                        s.setStaffMember(staffMember);
                        s.setDayOfWeek(day);
                        return s;
                    });

            schedule.setIsWorking(Boolean.TRUE.equals(entryDTO.getIsWorking()));
            if (schedule.getIsWorking()) {
                schedule.setWorkStart(LocalTime.parse(entryDTO.getWorkStart()));
                schedule.setWorkEnd(LocalTime.parse(entryDTO.getWorkEnd()));
                schedule.setBreakStart(entryDTO.getBreakStart() != null ? LocalTime.parse(entryDTO.getBreakStart()) : null);
                schedule.setBreakEnd(entryDTO.getBreakEnd() != null ? LocalTime.parse(entryDTO.getBreakEnd()) : null);
            } else {
                schedule.setWorkStart(null);
                schedule.setWorkEnd(null);
                schedule.setBreakStart(null);
                schedule.setBreakEnd(null);
            }

            staffScheduleRepository.save(schedule);
        }

        return getSchedule(businessPublicId, staffPublicId, auth);
    }

    private StaffScheduleEntryDTO mapToDTO(StaffSchedule schedule) {
        return StaffScheduleEntryDTO.builder()
                .dayOfWeek(schedule.getDayOfWeek().name())
                .isWorking(schedule.getIsWorking())
                .workStart(schedule.getWorkStart() != null ? schedule.getWorkStart().toString() : null)
                .workEnd(schedule.getWorkEnd() != null ? schedule.getWorkEnd().toString() : null)
                .breakStart(schedule.getBreakStart() != null ? schedule.getBreakStart().toString() : null)
                .breakEnd(schedule.getBreakEnd() != null ? schedule.getBreakEnd().toString() : null)
                .build();
    }
}
