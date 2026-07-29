-- ─────────────────────────────────────────────────────────────────────────────
-- V7 — Google Calendar OAuth tokens + appointment event tracking
-- ─────────────────────────────────────────────────────────────────────────────

-- Google Calendar OAuth tokens per account
-- Refresh tokens are stored encrypted (AES-256)
CREATE TABLE google_calendar_tokens (
    id             BIGSERIAL PRIMARY KEY,
    account_id     BIGINT NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
    access_token   TEXT NOT NULL,
    refresh_token  TEXT NOT NULL,
    expires_at     TIMESTAMP NOT NULL,
    google_email   VARCHAR(255),
    calendar_id    VARCHAR(255) NOT NULL DEFAULT 'primary',
    created_at     TIMESTAMP NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP NOT NULL DEFAULT now()
);

-- Store the Google Calendar event ID on each appointment so it can be deleted on cancellation
ALTER TABLE appointments
    ADD COLUMN google_event_id VARCHAR(255);
