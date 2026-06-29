-- ============================================================
-- V3: Fix missing Staff Schedules
-- Creates schedules for any staff members that were created
-- without schedules (due to a bug in Business/StaffService).
-- ============================================================

-- Seed Mon-Fri for any staff missing schedules
INSERT INTO staff_schedules (
    staff_member_id, day_of_week, is_working,
    work_start, work_end, break_start, break_end
)
SELECT
    id,
    unnest(ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY']),
    true,
    COALESCE(work_start, '09:00:00'::TIME),
    COALESCE(work_end, '17:00:00'::TIME),
    break_start,
    break_end
FROM staff_members
WHERE id NOT IN (SELECT staff_member_id FROM staff_schedules);

-- Saturday same hours
INSERT INTO staff_schedules (
    staff_member_id, day_of_week, is_working,
    work_start, work_end, break_start, break_end
)
SELECT 
    id, 
    'SATURDAY', 
    false, 
    COALESCE(work_start, '09:00:00'::TIME), 
    COALESCE(work_end, '17:00:00'::TIME), 
    break_start, 
    break_end
FROM staff_members
WHERE id NOT IN (SELECT staff_member_id FROM staff_schedules WHERE day_of_week = 'SATURDAY');

-- Sunday closed
INSERT INTO staff_schedules (staff_member_id, day_of_week, is_working)
SELECT id, 'SUNDAY', false
FROM staff_members
WHERE id NOT IN (SELECT staff_member_id FROM staff_schedules WHERE day_of_week = 'SUNDAY');
