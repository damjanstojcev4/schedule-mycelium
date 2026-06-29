package com.damjan.scheduler_mycelium.domain.staff;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffScheduleRepository extends JpaRepository<StaffSchedule, Long> {
    List<StaffSchedule> findByStaffMemberIdOrderByDayOfWeek(Long staffMemberId);
    Optional<StaffSchedule> findByStaffMemberIdAndDayOfWeek(Long staffMemberId, DayOfWeek dayOfWeek);
    Optional<StaffSchedule> findByPublicId(UUID publicId);
}
