-- Add color field to services for calendar appointment visualization
ALTER TABLE services
    ADD COLUMN color VARCHAR(7) NOT NULL DEFAULT '#3b82f6';
