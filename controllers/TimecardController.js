// Proprietary Software License
// Copyright (c) 2025 Mark Robertson
// See LICENSE.txt file for details.

const { Router } = require("express");
const {
  getAllTimecards,
  getTimecardById,
  createTimecard,
  updateTimecard,
  deleteTimecard,
  getTimecardsByEmployeeId,
  getTimecardsByEmployeeAndDateRange,
} = require("../queries/TimecardQueries");

// Import middleware functions
const {
  validateIdMiddleware,
  validateTimecardExistsMiddleware,
} = require("../middleware");

const timecardsController = Router();

// GET all timecards
timecardsController.get("/", async (request, response) => {
  try {
    const timecards = await getAllTimecards();
    response.status(200).json({ data: timecards });
  } catch (err) {
    console.error(`Error in GET /timecards: ${err.message}`);
    response.status(500).json({ error: "Internal server error while getting all Timecards. Please contact support." });
  }
});

// Get timecard by ID
timecardsController.get(
  "/:id",
  validateIdMiddleware,
  validateTimecardExistsMiddleware,
  async (request, response) => {
    try {
      const { id } = request.params;
      const timecard = await getTimecardById(id);
      response.status(200).json({ data: timecard });
    } catch (err) {
      console.error(`Error in GET /timecards: ${err.message}`);
      response.status(500).json({ error: "Internal server error while getting Timecard by ID. Please contact support." });
    }
  }
);


// Create new timecard
timecardsController.post("/", async (request, response) => {
  try {
    console.log("POST request received for timecards");
    console.log("Request body:", request.body);
    const { employee_id, work_date, status, morning_activity, afternoon_activity } = request.body;

    if (!employee_id || !work_date) {
      return response.status(400).json({
        error: 'Missing required fields',
        fields: { employee_id, work_date }
      });
    }

    // Validate 'status' if provided
    const validStatuses = ['active', 'submitted'];
    if (status && !validStatuses.includes(status.toLowerCase())) {
      return response.status(400).json({
        error: `Invalid status value. Valid statuses are: ${validStatuses.join(', ')}`,
        receivedStatus: status
      });
    }

    // Validate 'morning_activity' and 'afternoon_activity' if provided
    const validActivities = ['Driving', 'Facility'];
    if (morning_activity && !validActivities.includes(morning_activity)) {
      return response.status(400).json({
        error: `Invalid morning activity value. Valid activities are: ${validActivities.join(', ')}`,
        receivedActivity: morning_activity
      });
    }
    if (afternoon_activity && !validActivities.includes(afternoon_activity)) {
      return response.status(400).json({
        error: `Invalid afternoon activity value. Valid activities are: ${validActivities.join(', ')}`,
        receivedActivity: afternoon_activity
      });
    }

    const newTimecard = await createTimecard(employee_id, work_date, request.body);

    // Log success message
    console.log(`Successfully created timecard with ID ${newTimecard.id} for employee ${employee_id} on ${work_date}. Timecard ID: ${newTimecard.id}`);

    response.status(201).json({ data: newTimecard });
  } catch (err) {
    console.error(`Error in POST /timecards: ${err.message}`);
    response.status(500).json({ error: "Internal server error while creating new timecard. Please contact support." });
  }
});


// Update timecard
timecardsController.put(
  "/:id",
  validateIdMiddleware,
  validateTimecardExistsMiddleware,
  async (request, response) => {
    try {
      const { id } = request.params;
      const {
        status,
        morning_activity,
        afternoon_activity,
        facility_start_time,
        facility_lunch_start,
        facility_lunch_end,
        facility_end_time,
        driving_start_time,
        driving_lunch_start,
        driving_lunch_end,
        driving_end_time,
        facility_total_hours,
        driving_total_hours,
      } = request.body;

      // Validate fields to ensure they exist before attempting to update
      const fieldsToUpdate = {};
      if (status !== undefined) fieldsToUpdate.status = status;
      if (morning_activity !== undefined) fieldsToUpdate.morning_activity = morning_activity;
      if (afternoon_activity !== undefined) fieldsToUpdate.afternoon_activity = afternoon_activity;
      if (facility_start_time !== undefined) fieldsToUpdate.facility_start_time = facility_start_time;
      if (facility_lunch_start !== undefined) fieldsToUpdate.facility_lunch_start = facility_lunch_start;
      if (facility_lunch_end !== undefined) fieldsToUpdate.facility_lunch_end = facility_lunch_end;
      if (facility_end_time !== undefined) fieldsToUpdate.facility_end_time = facility_end_time;
      if (driving_start_time !== undefined) fieldsToUpdate.driving_start_time = driving_start_time;
      if (driving_lunch_start !== undefined) fieldsToUpdate.driving_lunch_start = driving_lunch_start;
      if (driving_lunch_end !== undefined) fieldsToUpdate.driving_lunch_end = driving_lunch_end;
      if (driving_end_time !== undefined) fieldsToUpdate.driving_end_time = driving_end_time;
      if (facility_total_hours !== undefined) fieldsToUpdate.facility_total_hours = facility_total_hours;
      if (driving_total_hours !== undefined) fieldsToUpdate.driving_total_hours = driving_total_hours;

      console.log("Fields to update:", fieldsToUpdate);

      if (Object.keys(fieldsToUpdate).length === 0) {
        console.log("No valid fields provided for update");
        return response.status(400).json({ error: 'No valid fields provided for update' });
      }

      const updatedTimecard = await updateTimecard(id, fieldsToUpdate);
      console.log(`Successfully updated timecard with ID ${id}`);
      response.status(200).json({ data: updatedTimecard });
    } catch (err) {
      console.log(`Error Updating Timecard: ${err.message}`)
      response.status(500).json({ error: "Internal server error while updating timecard. Please contact support." });
    }
  }
);

// Delete timecard
timecardsController.delete(
  "/:id",
  validateIdMiddleware,
  validateTimecardExistsMiddleware,
  async (request, response) => {
    try {
      const { id } = request.params;
      const deletedTimecard = await deleteTimecard(id);

      // Log success message
      console.log(`Successfully deleted timecard with ID ${id}`);

      response.status(200).json({ message: `Timecard ${deletedTimecard.id} deleted successfully`, data: deletedTimecard });
    } catch (err) {
      console.log(`Error Deleting Timecard: ${err.message}`)
      response.status(500).json({ error: "Internal server error while fetching timecard. Please contact support." });
    }
  }
);

// GET all timecards for a specific employee
timecardsController.get(
  "/employee/:employeeId",
  async (request, response) => {
    try {
      const { employeeId } = request.params;
      const timecards = await getTimecardsByEmployeeId(employeeId);
      response.status(200).json({ data: timecards });
    } catch (err) {
      console.log(`Error getting all timecards for ${employeeId}: ${err.message}`)
      response.status(500).json({ error: "Internal server error while fetching timecard. Please contact support." });
    }
  }
);

// GET a timecard for a specific employee for a specific date range
timecardsController.get('/employee/:employeeId/range/:startDate/:endDate', async (request, response) => {
  const { employeeId, startDate, endDate } = request.params;
  try {
    const timecards = await getTimecardsByEmployeeAndDateRange(employeeId, startDate, endDate);
    if (timecards.length > 0) { // Check if any timecards are found
      response.status(200).json({ data: timecards });
    } else {
      console.log(`No timecards found for employee ID ${employeeId} between ${startDate} and ${endDate}. Creating new entries...`);
      response.status(200).json({ data: timecards });
    }
  } catch (err) {
    console.error(`Error fetching timecard for employee ID ${employeeId} between ${startDate} and ${endDate}: ${err.message}`);
    response.status(500).json({ error: "Internal server error while fetching timecards. Please contact support." });
  }
});


module.exports = timecardsController;
