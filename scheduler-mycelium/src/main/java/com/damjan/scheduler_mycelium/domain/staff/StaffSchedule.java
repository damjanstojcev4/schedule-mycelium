package com.damjan.scheduler_mycelium.domain.staff;

import jakarta.persistence.*;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "staff_schedules",
    uniqueConstraints = @UniqueConstraint(columnNames = {"staff_member_id", "day_of_week"}))
@Data
public class StaffSchedule {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, updatable = false)
    private UUID publicId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_member_id", nullable = false)
    private StaffMember staffMember;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(nullable = false)
    private Boolean isWorking = true;

    private LocalTime workStart;
    private LocalTime workEnd;
    private LocalTime breakStart;
    private LocalTime breakEnd;

    @PrePersist
    protected void onCreate() {
        if (publicId == null) publicId = UUID.randomUUID();
    }

    // helpers
    public boolean isDuringBreak(LocalTime start, LocalTime end) {
        if (breakStart == null || breakEnd == null) return false;
        return start.isBefore(breakEnd) && end.isAfter(breakStart);
    }

    public boolean isWithinWorkingHours(LocalTime start, LocalTime end) {
        if (workStart == null || workEnd == null) return false;
        return !start.isBefore(workStart) && !end.isAfter(workEnd);
    }
}
