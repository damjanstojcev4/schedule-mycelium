package com.damjan.scheduler_mycelium.domain.customer;

import com.damjan.scheduler_mycelium.domain.account.Account;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customers")
@Data
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, updatable = false)
    private UUID publicId;

    // 1-to-1: every CUSTOMER-role account gets exactly one Customer profile.
    // Created automatically during registration.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    @Column(nullable = false)
    private String fullName;

    private String phone;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ─── Lifecycle ───────────────────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        this.publicId = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
    }
}
