-- Proprietary Software License
-- Copyright (c) 2025 Mark Robertson
-- See LICENSE.txt file for details.



-- Insert employees
INSERT INTO employees (firebase_uid, paychex_id, first_name, last_name, email, phone, position, is_admin) VALUES
('EdkK1ZljtmemwCpa1qGCl02e8Uj2', '50001', 'Admin', 'Admin', 'wcac.systems.engineer@gmail.com', '000-000-0000', 'Administrator', true),
(NULL, '502', 'Jane', 'Smith', 'jane.smith@example.com', '732-555-5678', 'Driver, Facility', false);

-- Insert timecards for Jane Smith (Nurse)
INSERT INTO timecards 
    (employee_id, work_date, morning_activity, driving_start_time, driving_lunch_start, facility_start_time, facility_lunch_start, afternoon_activity, driving_lunch_end, driving_end_time, facility_lunch_end, facility_end_time, driving_total_hours, facility_total_hours, status) 
VALUES
(2, '2024-10-21', 'Driving', '07:00', '10:00', NULL, NULL, 'Driving', '10:30', '15:00', NULL, NULL, '07:30', NULL, 'submitted'),
(2, '2024-10-22', 'Facility', NULL, NULL, '08:00', '12:00', 'Facility', NULL, NULL, '12:30', '16:00', NULL, '07:30', 'submitted'),
(2, '2024-10-23', 'Driving', '07:30', '11:00', NULL, NULL, 'Facility', '12:00', '14:30', NULL, NULL,'03:30', '02:30', 'submitted'),
(2, '2024-10-24', 'Driving', '07:00', '10:00', NULL, NULL, 'Driving', '10:30', '15:00', NULL, NULL, '07:30', NULL, 'submitted'),
(2, '2024-10-25', 'Facility', NULL, NULL, '08:00', '12:00', 'Facility', NULL, NULL, '12:30', '16:00', NULL, '07:30', 'submitted'),
(2, '2024-10-28', 'Driving', '07:00', '10:00', NULL, NULL, 'Driving', '10:30', '14:00', NULL, NULL, '06:30', NULL, 'submitted'),
(2, '2024-10-29', 'Facility', NULL, NULL, '08:30', '12:00', 'Facility', NULL, NULL, '12:30', '15:30', NULL, '06:30', 'submitted'),
(2, '2024-10-30', 'Driving', '08:00', '12:00', NULL, NULL, 'Driving', '12:30', '16:00', NULL, NULL, '07:30', NULL, 'submitted'),
(2, '2024-10-31', 'Driving', '07:00', '10:00', NULL, NULL, 'Driving', '10:30', '15:00', NULL, NULL, '07:30', NULL, 'submitted'),
(2, '2024-11-01', 'Facility', NULL, NULL, '08:00', '12:00', 'Facility', NULL, NULL, '12:30', '16:00', NULL, '07:30', 'submitted'),
(2, '2024-11-04', 'Driving', '07:00', '10:00', NULL, NULL, 'Driving', '10:30', '15:00', NULL, NULL, '07:30', NULL, 'submitted'),
(2, '2024-11-05', 'Facility', NULL, NULL, '08:00', '12:00', 'Facility', NULL, NULL, '12:30', '16:00', NULL, '07:30', 'submitted'),
(2, '2024-11-06', 'Driving', '07:30', '11:00', NULL, NULL, 'Driving', '11:30', '14:30', NULL, NULL, '06:30', NULL, 'submitted'),
(2, '2024-11-07', 'Driving', '07:00', '10:00', NULL, NULL, 'Driving', '10:30', '15:00', NULL, NULL, '07:30', NULL, 'submitted'),
(2, '2024-11-08', 'Facility', NULL, NULL, '08:00', '12:00', 'Facility', NULL, NULL, '12:30', '16:00', NULL, '07:30', 'submitted'),
(2, '2024-11-11', 'Driving', '07:00', '10:00', NULL, NULL, 'Driving', '10:30', '15:00', NULL, NULL, '07:30', NULL, 'active'),
(2, '2024-11-12', 'Facility', NULL, NULL, '08:00', '12:00', 'Facility', NULL, NULL, '12:30', '16:00', NULL, '07:30', 'active');

