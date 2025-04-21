// Proprietary Software License
// Copyright (c) 2025 Mark Robertson
// See LICENSE.txt file for details.

const { Router } = require("express");

const {
  getTotalHoursWorkedByEmployeeByDateRange,
  getTotalHoursWorkedByAllEmployeesByDateRange,
  getDetailedTimecardsByEmployee,
  getEmployeeSummaryById,
  getEmployeeSummaryForAll,
} = require("../queries/ReportQueries");

// Import middleware functions
const { validateDateRangeMiddleware } = require("../middleware");

const reportsController = Router();

// Get total hours report by date range
reportsController.get(
  "/",
  //validateIdMiddleware, // Validate ID middleware (already imported)
  validateDateRangeMiddleware, // New date range validation middleware
  async (request, response) => {
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    const { employeeId, startDate, endDate } = request.query;
    try {
      console.log(
        `Received request for employeeId: ${employeeId}, startDate: ${startDate}, endDate: ${endDate}`
      );
      const reportData = await getTotalHoursWorkedByEmployeeByDateRange(
        employeeId,
        startDate,
        endDate
      );
      response.status(200).json(reportData);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }
);

// GET timecards for all employees for a specific date range
reportsController.get(
  "/all/range/:startDate/:endDate",
  async (request, response) => {
    const { startDate, endDate } = request.params;
    try {
      const timecards = await getTotalHoursWorkedByAllEmployeesByDateRange(
        startDate,
        endDate
      );
      if (timecards.length > 0) {
        response.status(200).json({ data: timecards });
      } else {
        response.status(404).json({ error: "No timecards found" });
      }
    } catch (err) {
      console.error(
        `Error fetching timecards for all employees between ${startDate} and ${endDate}: ${err.message}`
      );
      response
        .status(500)
        .json({
          error:
            "Internal server error while fetching timecards. Please contact support.",
        });
    }
  }
);

reportsController.get(
  "/:employeeId",
  validateDateRangeMiddleware,
  async (request, response) => {
    const { employeeId } = request.params;
    const { startDate, endDate } = request.query;
    console.log("Received:", { employeeId, startDate, endDate });
    try {
      const reportData = await getTotalHoursWorkedByEmployeeByDateRange(
        employeeId,
        startDate,
        endDate
      );
      response.status(200).json(reportData);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }
);

// Get detailed timecards for an employee within a date range
reportsController.get(
  "/detailed/:employeeId",
  validateDateRangeMiddleware,
  async (request, response) => {
    const { employeeId } = request.params;
    const { startDate, endDate } = request.query;

    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required." });
    }

    try {
      const reportData = await getDetailedTimecardsByEmployee(
        employeeId,
        startDate,
        endDate
      );
      console.log(startDate, endDate);
      response.status(200).json(reportData);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }
);

reportsController.get(
  "/employee-summary/:employeeId",
  async (request, response) => {
    const { employeeId } = request.params; // Extract employeeId from params
    const { startDate, endDate, period } = request.query; // Extract other parameters from query string

    // Validate employeeId for individual employees: check if it's a number
    if (!employeeId || isNaN(Number(employeeId))) {
      return response
        .status(400)
        .json({ error: "Invalid or missing employeeId" });
    }

    try {
      // Call the getEmployeeSummaryById function for a single employee
      const report = await getEmployeeSummaryById(
        employeeId,
        period,
        startDate,
        endDate
      );

      // If report is empty, return 404
      if (!report || report.length === 0) {
        return response
          .status(404)
          .json({
            message: "No data found for the specified employee and date range",
          });
      }

      // Return the employee summary report
      return response.status(200).json(report);
    } catch (error) {
      return response
        .status(500)
        .json({ error: "Error generating employee summary report" });
    }
  }
);

reportsController.get("/all/employee-summary", async (req, res) => {
  const { startDate, endDate, period } = req.query;

  try {
    const report = await getEmployeeSummaryForAll(period, startDate, endDate);
    if (!report || report.length === 0) {
      return res.status(200).json({
        data: [],
        message: "No data found for the specified date range",
        status: "success",
      });
    }
    return res.status(200).json({
      data: report,
      message: "Employee summary retrieved successfully",
      status: "success",
    });
  } catch (error) {
    console.error(`Error in getEmployeeSummaryForAll: ${error.message}`);
    return res.status(500).json({
      data: [],
      message: "Error generating summary report for all employees",
      status: "error",
    });
  }
});

module.exports = reportsController;
