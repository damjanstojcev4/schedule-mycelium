-- ============================================================
-- V1: Initial Schema (Baseline — already applied in production)
-- This file is marked as applied via baseline-on-migrate=true
-- Flyway will never execute this file on an existing database
-- ============================================================

CREATE TABLE IF NOT EXISTS accounts (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS businesses (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID UNIQUE,
    slug VARCHAR(255) UNIQUE,
    owner_account_id BIGINT REFERENCES accounts(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    address VARCHAR(255),
    solo_operator BOOLEAN DEFAULT true,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_settings (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT UNIQUE REFERENCES businesses(id),
    cancellation_cutoff_hours INTEGER NOT NULL DEFAULT 24,
    slot_interval_minutes INTEGER NOT NULL DEFAULT 15,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_closures (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT REFERENCES businesses(id),
    closure_date DATE NOT NULL,
    reason VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS staff_members (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID UNIQUE,
    business_id BIGINT REFERENCES businesses(id),
    account_id BIGINT REFERENCES accounts(id),
    name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255),
    work_start TIME,
    work_end TIME,
    break_start TIME,
    break_end TIME,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_days_off (
    id BIGSERIAL PRIMARY KEY,
    staff_member_id BIGINT REFERENCES staff_members(id),
    day_off DATE NOT NULL,
    UNIQUE (staff_member_id, day_off)
);

CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID UNIQUE,
    business_id BIGINT REFERENCES businesses(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID UNIQUE,
    account_id BIGINT UNIQUE REFERENCES accounts(id),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID UNIQUE,
    business_id BIGINT REFERENCES businesses(id),
    staff_member_id BIGINT REFERENCES staff_members(id),
    customer_id BIGINT REFERENCES customers(id),
    service_id BIGINT REFERENCES services(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
    cancelled_by VARCHAR(50),
    notes TEXT,
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    guest_phone VARCHAR(255),
    google_event_id VARCHAR(255),
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS google_calendar_tokens (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT UNIQUE REFERENCES accounts(id),
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
