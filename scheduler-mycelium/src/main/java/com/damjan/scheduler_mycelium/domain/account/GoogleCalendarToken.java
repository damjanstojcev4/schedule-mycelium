package com.damjan.scheduler_mycelium.domain.account;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Stores encrypted Google OAuth tokens for a business owner account.
 * One record per account (UNIQUE on account_id).
 * Both access_token and refresh_token are AES-256 encrypted before storage.
 */
@Entity
@Table(name = "google_calendar_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleCalendarToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    /** AES-256 encrypted access token */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String accessToken;

    /** AES-256 encrypted refresh token */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String refreshToken;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    /** The Google account email that granted access */
    private String googleEmail;

    /** Usually "primary" — the owner's main calendar */
    @Builder.Default
    @Column(nullable = false)
    private String calendarId = "primary";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Returns true if the access token has expired (or will expire within 5 minutes).
     * Caller should refresh before using the token.
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt.minusMinutes(5));
    }
}
