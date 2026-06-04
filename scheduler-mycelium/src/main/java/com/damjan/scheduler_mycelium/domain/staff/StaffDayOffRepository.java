package com.damjan.scheduler_mycelium.domain.staff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StaffDayOffRepository extends JpaRepository<StaffDayOff, Long> {
    List<StaffDayOff> findByStaffMemberId(Long staffMemberId);

    boolean existsByStaffMemberIdAndDayOff(Long staffMemberId, LocalDate dayOff);
}
