package com.damjan.scheduler_mycelium.domain.business;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "business_closures")
@Data
public class BusinessClosure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    // The date the whole business is closed (holiday, vacation, etc.)
    @Column(nullable = false)
    private LocalDate closureDate;

    // Optional human-readable reason, e.g. "National holiday", "Staff training"
    private String reason;

}
