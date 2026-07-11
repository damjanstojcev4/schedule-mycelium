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

        @org.springframework.data.jpa.repository.Modifying
        @Query("UPDATE Appointment a SET a.status = 'COMPLETED' WHERE a.status = 'BOOKED' AND a.endTime <= :now")
        int completePastAppointments(@Param("now") LocalDateTime now);

        // ─── Public cancellation ──────────────────────────────────────────────────

        /**
         * Returns upcoming BOOKED appointments matching a guest email or a registered
         * customer's account email. Used exclusively by the public cancellation flow.
         * Case-insensitive comparison via LOWER() — caller must pass a lower-cased email.
         */
        @Query("""
                SELECT a FROM Appointment a
                LEFT JOIN a.customer c
                LEFT JOIN c.account acc
                WHERE a.status = 'BOOKED'
                AND a.startTime > :now
                AND (
                    LOWER(a.guestEmail) = LOWER(:email)
                    OR (c IS NOT NULL AND LOWER(acc.email) = LOWER(:email))
                )
                ORDER BY a.startTime ASC
                """)
        List<Appointment> findBookedByGuestEmailOrCustomerEmail(
                @Param("email") String email,
                @Param("now") LocalDateTime now);

        // ─── Reporting ────────────────────────────────────────────────────────────

        /**
         * Returns all appointments for a business whose startTime falls within
         * [from, to) — used exclusively by the Reports service.
         * The idx_appointment_business and idx_appointment_start_time indexes
         * cover this query efficiently.
         */
        List<Appointment> findByBusinessIdAndStartTimeBetween(
                Long businessId,
                LocalDateTime from,
                LocalDateTime to);
}
