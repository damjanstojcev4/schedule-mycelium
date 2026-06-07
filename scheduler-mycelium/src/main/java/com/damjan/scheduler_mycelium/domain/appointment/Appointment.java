package com.damjan.scheduler_mycelium.domain.appointment;

import com.damjan.scheduler_mycelium.domain.business.Business;
import com.damjan.scheduler_mycelium.domain.customer.Customer;
import com.damjan.scheduler_mycelium.domain.service.Service;
import com.damjan.scheduler_mycelium.domain.staff.StaffMember;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "appointments",
        indexes = {
                // Heavily queried paths — indexed for performance
                @Index(name = "idx_appointment_business",    columnList = "business_id"),
                @Index(name = "idx_appointment_staff",       columnList = "staff_member_id"),
                @Index(name = "idx_appointment_customer",    columnList = "customer_id"),
                @Index(name = "idx_appointment_start_time",  columnList = "start_time")
        }
)
@Data
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, updatable = false)
    private UUID publicId;

    // ─── Relationships ───────────────────────────────────────────────────────

    // Tenant discriminator — every appointment belongs to one business
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_member_id", nullable = false)
    private StaffMember staffMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = true)
    private Customer customer;

    private String guestName;
    private String guestEmail;
    private String guestPhone;

    // Kept for historical record even if the service is later deactivated
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    // ─── Timing ──────────────────────────────────────────────────────────────

    @Column(nullable = false)
    private LocalDateTime startTime;

    // Computed at booking time: startTime + service.durationMinutes
    // Stored explicitly so queries don't need to join services for time checks
    @Column(nullable = false)
    private LocalDateTime endTime;

    // ─── Status ──────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.BOOKED;

    // Only populated when status = CANCELLED
    @Enumerated(EnumType.STRING)
    private CancelledBy cancelledBy;

    // ─── Extra ───────────────────────────────────────────────────────────────

    // Optional notes from the customer at booking time
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ─── Enums ───────────────────────────────────────────────────────────────

    public enum Status {
        BOOKED,
        CANCELLED,
        COMPLETED
    }

    public enum CancelledBy {
        CUSTOMER,
        STAFF,
        BUSINESS_OWNER
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        this.publicId = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
    }
}
