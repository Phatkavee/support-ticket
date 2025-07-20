-- Migration script to convert existing UTC timestamps to Asia/Bangkok timezone
-- Run this AFTER running the main schema

-- Set timezone for this session
SET timezone = 'Asia/Bangkok';

-- Update existing data in projects table
UPDATE projects 
SET 
    created_at = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok',
    updated_at = updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'
WHERE created_at IS NOT NULL OR updated_at IS NOT NULL;

-- Update existing data in tickets table
UPDATE tickets 
SET 
    created_at = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok',
    updated_at = updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok',
    sla_deadline = sla_deadline AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok',
    resolved_at = CASE 
        WHEN resolved_at IS NOT NULL 
        THEN resolved_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok' 
        ELSE NULL 
    END,
    closed_at = CASE 
        WHEN closed_at IS NOT NULL 
        THEN closed_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok' 
        ELSE NULL 
    END
WHERE created_at IS NOT NULL OR updated_at IS NOT NULL OR sla_deadline IS NOT NULL;

-- Update existing data in ticket_attachments table
UPDATE ticket_attachments 
SET created_at = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'
WHERE created_at IS NOT NULL;

-- Update existing data in ticket_comments table
UPDATE ticket_comments 
SET 
    created_at = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok',
    updated_at = updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'
WHERE created_at IS NOT NULL OR updated_at IS NOT NULL;

-- Update existing data in ticket_change_logs table
UPDATE ticket_change_logs 
SET created_at = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'
WHERE created_at IS NOT NULL;

-- Update existing data in ticket_feedback table
UPDATE ticket_feedback 
SET created_at = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'
WHERE created_at IS NOT NULL;

-- Show sample of converted data
SELECT 
    'projects' as table_name,
    created_at,
    updated_at
FROM projects 
LIMIT 3;

-- Show tickets sample
SELECT 
    'tickets' as table_name,
    created_at,
    updated_at
FROM tickets 
LIMIT 3;
