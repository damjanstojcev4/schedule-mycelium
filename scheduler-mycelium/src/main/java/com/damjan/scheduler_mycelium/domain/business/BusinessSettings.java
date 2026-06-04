package com.damjan.scheduler_mycelium.domain.business;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "business_settings")
@Data
public class BusinessSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1-to-1 with Business. Created automatically when a business registers.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false, unique = true)
    private Business business;

    // How many hours before the appointment a customer can still cancel.
    // Default: 24 hours.
    @Column(nullable = false)
    private Integer cancellationCutoffHours = 24;

    // Granularity for slot display on the booking UI (e.g. every 15 or 30 min).
    // The actual appointment length still comes from the service's durationMinutes.
    @Column(nullable = false)
    private Integer slotIntervalMinutes = 15;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
