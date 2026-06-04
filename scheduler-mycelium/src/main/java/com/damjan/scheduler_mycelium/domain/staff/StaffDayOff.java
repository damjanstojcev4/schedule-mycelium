package com.damjan.scheduler_mycelium.domain.staff;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(
        name = "staff_days_off",
        // Prevent duplicate day-off entries for the same staff member on the same date
        uniqueConstraints = @UniqueConstraint(columnNames = {"staff_member_id", "day_off"})
)
@Data
public class StaffDayOff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_member_id", nullable = false)
    private StaffMember staffMember;

    // The specific date this staff member is not working
    @Column(nullable = false)
    private LocalDate dayOff;
}
