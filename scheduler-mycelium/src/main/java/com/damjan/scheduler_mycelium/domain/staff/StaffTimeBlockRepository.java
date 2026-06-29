package com.damjan.scheduler_mycelium.domain.staff;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffTimeBlockRepository extends JpaRepository<StaffTimeBlock, Long> {
    List<StaffTimeBlock> findByStaffMemberIdAndBlockDate(Long staffMemberId, LocalDate blockDate);
    Optional<StaffTimeBlock> findByPublicId(UUID publicId);
    List<StaffTimeBlock> findByBusinessIdAndBlockDate(Long businessId, LocalDate blockDate);
}
