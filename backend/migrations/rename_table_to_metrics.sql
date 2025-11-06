-- Migration script to rename kafka_application_metrics table to metrics
-- Run this script in your PostgreSQL database

-- Step 1: Rename the table
ALTER TABLE kafka_application_metrics RENAME TO metrics;

-- Step 2: Update any indexes that reference the old table name (if they exist)
-- Note: PostgreSQL automatically renames indexes when you rename a table,
-- but if you have custom indexes with specific names, you might want to rename them too

-- Step 3: Update any constraints that reference the old table name (if they exist)
-- Note: PostgreSQL automatically updates constraint names when you rename a table

-- Verification query - run this to confirm the table was renamed successfully
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'metrics' AND table_schema = 'public';

-- Optional: If you want to see all tables in your database
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;