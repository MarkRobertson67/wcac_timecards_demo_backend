// Proprietary Software License
// Copyright (c) 2025 Mark Robertson
// See LICENSE.txt file for details.

const db = require("../db/dbConfig");


// Get all timecards
const getAllTimecards = async () => {
    try {
        const query = `
            SELECT 
                *, 
                COALESCE(facility_total_hours, null) AS facility_total_hours,
                COALESCE(driving_total_hours, null) AS driving_total_hours
            FROM timecards
            ORDER BY id ASC
        `;
        const timecards = await db.any(query);
        console.log("Successfully retrieved all timecards");
        return timecards;
    } catch (error) {
        console.log(`Error retrieving all timecards: ${error.message}`);
        throw new Error(`Error retrieving all timecards. Please contact support.`);
    }
};



const getTimecardById = async (id) => {
    try {
        const query = `
            SELECT 
                *, 
                COALESCE(facility_total_hours, null) AS facility_total_hours,
                COALESCE(driving_total_hours, null) AS driving_total_hours
            FROM timecards
            WHERE id = $1
        `;
        const timecard = await db.oneOrNone(query, [id]);
        if (timecard) {
            console.log(`Successfully retrieved timecard with ID ${id}`);
        } else {
            console.log(`No timecard found with ID ${id}`);
        }
        return timecard;
    } catch (error) {
        console.log(`Error retrieving timecard with ID ${id}: ${error.message}`);
        throw new Error(`Error retrieving timecard with ID ${id}. Please contact support.`);
    }
};

  
  // Create a new timecard
const createTimecard = async (employee_id, work_date, data) => {
    try {
        const keys = [
            'morning_activity', 'afternoon_activity',
            'facility_start_time', 'facility_lunch_start', 'facility_lunch_end', 'facility_end_time',
            'driving_start_time', 'driving_lunch_start', 'driving_lunch_end', 'driving_end_time',
            'facility_total_hours', 'driving_total_hours', 'status'
        ];

        // Update to handle null values correctly for missing or empty data
        const fields = keys.filter(key => data[key] !== undefined && data[key] !== "");
        const values = fields.map(field => {
            if (data[field] && typeof data[field] === 'object' && Object.keys(data[field]).length === 0) {
                return null; // Set empty objects to null
            } else {
                return data[field]; // Set other values as they are
            }
        });

        if (fields.length === 0) {
            throw new Error('No valid fields provided for timecard creation');
        }

        // If 'status' is not provided, default it to 'active'
        if (!fields.includes('status')) {
            fields.push('status');
            values.push('active');
        }

        // Build the query dynamically
        const fieldsSQL = fields.join(', ');
        const valuesPlaceholders = fields.map((_, index) => `$${index + 3}`).join(', '); // $1 and $2 are reserved for employee_id and work_date

        const query = `
            INSERT INTO timecards (employee_id, work_date, ${fieldsSQL})
            VALUES ($1, $2, ${valuesPlaceholders}) RETURNING *;
        `;

        const newTimecard = await db.one(query, [employee_id, work_date, ...values]);

        console.log(`Successfully created new timecard for employee ${employee_id} on ${work_date}`);
        return newTimecard;
    } catch (error) {
        console.error(`Error creating new timecard: ${error.message}`);
        throw new Error(`Error creating new timecard. Please contact support.`);
    }
};


// Update a timecard
const updateTimecard = async (id, fieldsToUpdate) => {
    try {
        // Ensure facility_total_hours and driving_total_hours are properly handled
        if (
            fieldsToUpdate.facility_total_hours &&
            typeof fieldsToUpdate.facility_total_hours === 'object' &&
            Object.keys(fieldsToUpdate.facility_total_hours).length === 0
        ) {
            fieldsToUpdate.facility_total_hours = null;
        }

        if (
            fieldsToUpdate.driving_total_hours &&
            typeof fieldsToUpdate.driving_total_hours === 'object' &&
            Object.keys(fieldsToUpdate.driving_total_hours).length === 0
        ) {
            fieldsToUpdate.driving_total_hours = null;
        }

        // Filter out undefined, null, or empty string fields from the update
        const validFields = Object.keys(fieldsToUpdate).filter(
            (field) => fieldsToUpdate[field] !== undefined && fieldsToUpdate[field] !== ""
        );

        if (validFields.length === 0) {
            throw new Error('No valid fields provided for update');
        }

        // Construct the SET clause dynamically
        const setClause = validFields.map((field, index) => `${field} = $${index + 2}`).join(", ");
        const values = [id, ...validFields.map(field => fieldsToUpdate[field])];

        const query = `
            UPDATE timecards
            SET ${setClause}
            WHERE id = $1
            RETURNING 
                *, 
                COALESCE(facility_total_hours, null) AS facility_total_hours,
                COALESCE(driving_total_hours, null) AS driving_total_hours;
        `;

        const updatedTimecard = await db.one(query, values);
        console.log(`Successfully updated timecard with ID ${id}`);
        return updatedTimecard;
    } catch (error) {
        console.error(`Error updating timecard with ID ${id}: ${error.message}`);
        throw new Error(`Error updating timecard with ID ${id}. Please contact support.`);
    }
};





// Delete a timecard by ID
const deleteTimecard = async (id) => {
    try {
        const deletedTimecard = await db.one(
            "DELETE FROM timecards WHERE id = $1 RETURNING *",
            [id]
        );
        console.log(`Successfully deleted timecard with ID ${id}`);
        return deletedTimecard;
    } catch (error) {
        console.log(`Error deleting timecard with ID ${id}: ${error.message}`)
        throw new Error(`Error deleting timecard with ID ${id}. Please contact support.`);
    }
};


// Get all timecards for a specific employee
const getTimecardsByEmployeeId = async (employeeId) => {
    try {
        const query = `
            SELECT 
                *, 
                COALESCE(facility_total_hours, null) AS facility_total_hours,
                COALESCE(driving_total_hours, null) AS driving_total_hours
            FROM timecards
            WHERE employee_id = $1
            ORDER BY work_date ASC
        `;
        const timecards = await db.any(query, [employeeId]);
        console.log(`Successfully retrieved timecards for employee with ID ${employeeId}`);
        return timecards;
    } catch (error) {
        console.log(`Error fetching timecards for employee with ID ${employeeId}: ${error.message}`);
        throw new Error(`Error fetching timecards for employee with ID ${employeeId}. Please contact support.`);
    }
};



// Get timecards for a specific employee between start and end dates
const getTimecardsByEmployeeAndDateRange = async (employeeId, startDate, endDate) => {
    try {
        const query = `
            SELECT 
                *, 
                COALESCE(facility_total_hours, null) AS facility_total_hours,
                COALESCE(driving_total_hours, null) AS driving_total_hours
            FROM timecards 
            WHERE employee_id = $1 AND work_date BETWEEN $2 AND $3
            ORDER BY work_date ASC;
        `;
        const timecards = await db.any(query, [employeeId, startDate, endDate]);
        if (timecards.length > 0) {
            console.log(`Successfully retrieved ${timecards.length} timecards for employee ID ${employeeId} between ${startDate} and ${endDate}`);
        } else {
            console.log(`No timecards found for employee ID ${employeeId} between ${startDate} and ${endDate}`);
        }
        return timecards;
    } catch (error) {
        console.error(`Error retrieving timecards for employee ID ${employeeId} between ${startDate} and ${endDate}: ${error.message}`);
        throw new Error(`Error retrieving timecards for employee ID ${employeeId} between ${startDate} and ${endDate}. Please contact support.`);
    }
};



module.exports = {
    getAllTimecards,
    getTimecardById,
    createTimecard,
    updateTimecard,
    deleteTimecard,
    getTimecardsByEmployeeId,
    getTimecardsByEmployeeAndDateRange,
};
