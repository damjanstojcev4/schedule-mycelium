-- Add slot mode to business settings
-- SERVICE_DRIVEN: slots step by service duration (current behavior, default)
-- INTERVAL_DRIVEN: slots step by slotIntervalMinutes (e.g. every 15 min)
ALTER TABLE business_settings
ADD COLUMN slot_mode VARCHAR(20) NOT NULL DEFAULT 'SERVICE_DRIVEN';

-- slotIntervalMinutes already exists (was unused)
-- It now drives the step in INTERVAL_DRIVEN mode
-- Default is already 15 from V1 — no change needed
