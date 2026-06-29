-- Weekly schedule per staff member
CREATE TABLE staff_schedules (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    staff_member_id BIGINT NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,
    is_working BOOLEAN NOT NULL DEFAULT true,
    work_start TIME,
    work_end TIME,
    break_start TIME,
    break_end TIME,
    UNIQUE (staff_member_id, day_of_week)
);

-- Seed from existing StaffMember flat fields (Mon-Fri working)
INSERT INTO staff_schedules (staff_member_id, day_of_week, is_working, work_start, work_end, break_start, break_end)
SELECT id, unnest(ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY']),
       true, work_start, work_end, break_start, break_end
FROM staff_members WHERE work_start IS NOT NULL;

-- Saturday same hours, editable later
INSERT INTO staff_schedules (staff_member_id, day_of_week, is_working, work_start, work_end, break_start, break_end)
SELECT id, 'SATURDAY', true, work_start, work_end, break_start, break_end
FROM staff_members WHERE work_start IS NOT NULL;

-- Sunday closed by default
INSERT INTO staff_schedules (staff_member_id, day_of_week, is_working)
SELECT id, 'SUNDAY', false FROM staff_members;

-- Manual time blocks
CREATE TABLE staff_time_blocks (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    staff_member_id BIGINT NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    block_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
