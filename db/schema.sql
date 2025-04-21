-- Proprietary Software License
-- Copyright (c) 2024 Mark Robertson
-- See LICENSE.txt file for details.



--  Drop tables if they exist
DROP TABLE IF EXISTS timecards;
DROP TABLE IF EXISTS employees;



-- Drop ENUM types if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_enum') THEN
        DROP TYPE status_enum;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_enum') THEN
        DROP TYPE activity_enum;
    END IF;
END $$;



-- Create the ENUM type for status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_enum') THEN
        CREATE TYPE status_enum AS ENUM ('active', 'submitted');
    END IF;
END $$;


DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_enum') THEN
        CREATE TYPE activity_enum AS ENUM ('Driving', 'Facility');
    END IF;
END $$;


-- Create employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(100) UNIQUE,
    paychex_id VARCHAR(50),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(50), -- Comma-separated roles, e.g., "Driver, Entertainment Director"
    is_admin BOOLEAN NOT NULL DEFAULT FALSE -- Track if employee has admin privileges
);


-- Create timecards table
CREATE TABLE timecards (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,

    morning_activity activity_enum NOT NULL DEFAULT 'Facility', -- Set default value to 'Facility'
    afternoon_activity activity_enum NOT NULL DEFAULT 'Facility', 

    facility_start_time TIME,
    facility_lunch_start TIME,
    facility_lunch_end TIME,
    facility_end_time TIME,

    driving_start_time TIME,
    driving_lunch_start TIME,
    driving_lunch_end TIME,
    driving_end_time TIME,

    facility_total_hours INTERVAL,
    driving_total_hours INTERVAL,

    status status_enum DEFAULT 'active',  -- ('active', 'submitted')
    CONSTRAINT unique_employee_work_date UNIQUE (employee_id, work_date) -- Unique constraint
);


-- Create indexes to speed up the database access
CREATE INDEX idx_employee_id ON timecards(employee_id);
CREATE INDEX idx_work_date ON timecards(work_date);
CREATE INDEX idx_employee_work_date ON timecards(employee_id, work_date);
CREATE INDEX idx_status ON timecards(status);
CREATE INDEX idx_is_admin ON employees(is_admin);
CREATE INDEX idx_firebase_uid ON employees(firebase_uid);
CREATE INDEX idx_email ON employees(email);


-- -- Function to prevent deletion of the specific admin account
-- CREATE OR REPLACE FUNCTION protect_specific_admin()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF OLD.firebase_uid = '7Yyz3S2X2iU5drTdZE65r8bxoCB2' THEN
--     RAISE EXCEPTION 'Cannot delete this specific admin account.';
--   END IF;
--   RETURN OLD;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Trigger to call the function before any delete operation on the employees table
-- CREATE TRIGGER protect_specific_admin_trigger
-- BEFORE DELETE ON employees
-- FOR EACH ROW
-- EXECUTE FUNCTION protect_specific_admin();


-- npm run db:setup  
-- npm start
