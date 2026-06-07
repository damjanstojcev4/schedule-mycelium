package com.damjan.scheduler_mycelium.domain.staff;

import com.damjan.scheduler_mycelium.domain.account.Account;
import com.damjan.scheduler_mycelium.domain.business.Business;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "staff_members")
@Data
public class StaffMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, updatable = false)
    private UUID publicId;

    // Which business this staff member belongs to (tenant discriminator)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    // The login account for this staff member
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false)
    private String name;

    // e.g. "Senior Barber", "Nail Technician", "Massage Therapist"
    private String roleTitle;

    // Daily working window — used by SlotAvailabilityService
    @Column(nullable = false)
    private LocalTime workStart;

    @Column(nullable = false)
    private LocalTime workEnd;

    // Optional daily break window.
    // Both null = no break configured.
    private LocalTime breakStart;
    private LocalTime breakEnd;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.publicId = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
    }

    // Returns true if a time slot overlaps this staff member's break window.
    // Called by SlotAvailabilityService — avoids duplicating null checks everywhere.
    public boolean isDuringBreak(LocalTime slotStart, LocalTime slotEnd) {
        if (breakStart == null || breakEnd == null) return false;
        return slotStart.isBefore(breakEnd) && slotEnd.isAfter(breakStart);
    }

    // Returns true if a time slot fits within working hours.
    public boolean isWithinWorkingHours(LocalTime slotStart, LocalTime slotEnd) {
        return !slotStart.isBefore(workStart) && !slotEnd.isAfter(workEnd);
    }
}
