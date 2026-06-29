package com.damjan.scheduler_mycelium.domain.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
        List<Appointment> findByStaffMemberId(Long staffMemberId);

        List<Appointment> findByCustomerId(Long customerId);

        List<Appointment> findByBusinessId(Long businessId);

        List<Appointment> findByBusinessIdIn(List<Long> businessIds);

        List<Appointment> findByStaffMemberAndStartTimeBetween(Long staffMemberId, LocalDateTime startTime,
                        LocalDateTime endTime);

        boolean existsByStaffMemberIdAndStartTimeBetween(Long staffMemberId, LocalDateTime startTime,
                        LocalDateTime endTime);

        @Query("""
                        SELECT COUNT(a) > 0 FROM Appointment a
                        WHERE a.staffMember.id = :staffMemberId
                        AND a.status = 'BOOKED'
                        AND a.startTime < :endTime
                        AND a.endTime > :startTime
                        """)
        boolean existsOverlappingAppointment(@Param("staffMemberId") Long staffMemberId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        Optional<Appointment> findByPublicId(UUID publicId);
}
