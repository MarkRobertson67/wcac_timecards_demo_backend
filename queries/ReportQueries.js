// Proprietary Software License
// Copyright (c) 2025 Mark Robertson
// See LICENSE.txt file for details.

const db = require("../db/dbConfig");

// Get total hours worked by employee within a date range
const getTotalHoursWorkedByEmployeeByDateRange = async (
  employee_id,
  startDate,
  endDate
) => {
  try {
    // If the employee_id is "ALL", delegate to the function handling all employees
    if (employee_id === "ALL") {
      return getTotalHoursWorkedByAllEmployeesByDateRange(startDate, endDate);
    }

    const query = `
            SELECT 
                e.id AS employee_id, 
                e.first_name, 
                e.last_name, 
                SUM(EXTRACT(HOUR FROM t.facility_total_hours)) AS facility_total_hours, 
                SUM(EXTRACT(MINUTE FROM t.facility_total_hours)) AS facility_total_minutes,
                SUM(EXTRACT(HOUR FROM t.driving_total_hours)) AS driving_total_hours, 
                SUM(EXTRACT(MINUTE FROM t.driving_total_hours)) AS driving_total_minutes

            FROM employees e
            JOIN timecards t ON e.id = t.employee_id
            WHERE e.id = $1 AND t.work_date BETWEEN $2 AND $3
            GROUP BY e.id, e.first_name, e.last_name
            ORDER BY e.id
        `;
    console.log(`Running query: ${query}`);
    console.log(
      `With params: employee_id = ${employee_id}, startDate = ${startDate}, endDate = ${endDate}`
    );

    const result = await db.any(query, [employee_id, startDate, endDate]);

    // Log the result to check what is returned from the query
    console.log("Query Result:", result);

    return result.map((employee) => {
      // Extract facility hours and minutes
      const facilityTotalHours =
        parseInt(employee.facility_total_hours, 10) || 0;
      const facilityTotalMinutes =
        parseInt(employee.facility_total_minutes, 10) || 0;

      // Adjust minutes into hours for facility hours
      const facilityHours =
        facilityTotalHours + Math.floor(facilityTotalMinutes / 60);
      const facilityMinutes = facilityTotalMinutes % 60;

      // Extract driving hours and minutes
      const drivingTotalHours = parseInt(employee.driving_total_hours, 10) || 0;
      const drivingTotalMinutes =
        parseInt(employee.driving_total_minutes, 10) || 0;

      // Adjust minutes into hours for driving hours
      const drivingHours =
        drivingTotalHours + Math.floor(drivingTotalMinutes / 60);
      const drivingMinutes = drivingTotalMinutes % 60;

      return {
        employee_id: employee.employee_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        facility_total_hours: {
          hours: facilityHours,
          minutes: facilityMinutes,
        },
        driving_total_hours: { hours: drivingHours, minutes: drivingMinutes },
      };
    });
  } catch (error) {
    throw new Error(`Error retrieving total hours worked: ${error.message}`);
  }
};

// Get timecards for all employees between start and end dates
const getTotalHoursWorkedByAllEmployeesByDateRange = async (
  startDate,
  endDate
) => {
  try {
    const query = `
        SELECT t.employee_id, e.first_name, e.last_name, 
               SUM(EXTRACT(HOUR FROM t.facility_total_hours)) AS facility_total_hours, 
                SUM(EXTRACT(MINUTE FROM t.facility_total_hours)) AS facility_total_minutes,
                SUM(EXTRACT(HOUR FROM t.driving_total_hours)) AS driving_total_hours, 
                SUM(EXTRACT(MINUTE FROM t.driving_total_hours)) AS driving_total_minutes
        FROM timecards t
        JOIN employees e ON t.employee_id = e.id
        WHERE t.work_date BETWEEN $1 AND $2
        GROUP BY t.employee_id, e.first_name, e.last_name
        ORDER BY t.employee_id;
    `;
    const result = await db.any(query, [startDate, endDate]);

    return result.map((employee) => {
      // Extract facility hours and minutes
      const facilityTotalHours =
        parseInt(employee.facility_total_hours, 10) || 0;
      const facilityTotalMinutes =
        parseInt(employee.facility_total_minutes, 10) || 0;

      // Adjust minutes into hours for facility hours
      const facilityHours =
        facilityTotalHours + Math.floor(facilityTotalMinutes / 60);
      const facilityMinutes = facilityTotalMinutes % 60;

      // Extract driving hours and minutes
      const drivingTotalHours = parseInt(employee.driving_total_hours, 10) || 0;
      const drivingTotalMinutes =
        parseInt(employee.driving_total_minutes, 10) || 0;

      // Adjust minutes into hours for driving hours
      const drivingHours =
        drivingTotalHours + Math.floor(drivingTotalMinutes / 60);
      const drivingMinutes = drivingTotalMinutes % 60;

      return {
        employee_id: employee.employee_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        facility_total_hours: {
          hours: facilityHours,
          minutes: facilityMinutes,
        },
        driving_total_hours: { hours: drivingHours, minutes: drivingMinutes },
      };
    });
  } catch (error) {
    console.error(
      `Error retrieving timecards for all employees between ${startDate} and ${endDate}: ${error.message}`
    );
    throw new Error(
      "Error retrieving timecards for all employees. Please contact support."
    );
  }
};

// Get detailed timecard entries for an employee within a date range
const getDetailedTimecardsByEmployee = async (
  employeeId,
  startDate,
  endDate
) => {
  try {
    const query = `
            SELECT 
                t.id AS timecard_id,
                t.work_date,
                t.facility_start_time,
                t.facility_end_time,
                t.facility_lunch_start,
                t.facility_lunch_end,
                t.driving_start_time,
                t.driving_end_time,
                t.driving_lunch_start,
                t.driving_lunch_end,
                EXTRACT(HOUR FROM t.facility_total_hours) AS facility_hours, 
                EXTRACT(MINUTE FROM t.facility_total_hours) AS facility_minutes,
                EXTRACT(HOUR FROM t.driving_total_hours) AS driving_hours,
                EXTRACT(MINUTE FROM t.driving_total_hours) AS driving_minutes
            FROM timecards t
            WHERE t.employee_id = $1 AND t.work_date BETWEEN $2 AND $3
            ORDER BY t.work_date
        `;
    console.log(`Running query: ${query}`);
    console.log(
      `With params: employeeId = ${employeeId}, startDate = ${startDate}, endDate = ${endDate}`
    );

    const result = await db.any(query, [employeeId, startDate, endDate]);
    console.log("Query Result:", result);

    return result.map((entry) => {
      // Parse facility total hours and minutes
      const facilityHours = parseInt(entry.facility_hours, 10) || 0;
      const facilityMinutes = parseInt(entry.facility_minutes, 10) || 0;
      const adjustedFacilityHours =
        facilityHours + Math.floor(facilityMinutes / 60);
      const adjustedFacilityMinutes = facilityMinutes % 60;

      // Parse driving total hours and minutes
      const drivingHours = parseInt(entry.driving_hours, 10) || 0;
      const drivingMinutes = parseInt(entry.driving_minutes, 10) || 0;
      const adjustedDrivingHours =
        drivingHours + Math.floor(drivingMinutes / 60);
      const adjustedDrivingMinutes = drivingMinutes % 60;

      return {
        timecard_id: entry.timecard_id,
        work_date: entry.work_date,
        facility_start_time: entry.facility_start_time,
        facility_end_time: entry.facility_end_time,
        facility_lunch_start: entry.facility_lunch_start,
        facility_lunch_end: entry.facility_lunch_end,
        driving_start_time: entry.driving_start_time,
        driving_end_time: entry.driving_end_time,
        driving_lunch_start: entry.driving_lunch_start,
        driving_lunch_end: entry.driving_lunch_end,
        facility_total_hours: {
          hours: adjustedFacilityHours,
          minutes: adjustedFacilityMinutes,
        },
        driving_total_hours: {
          hours: adjustedDrivingHours,
          minutes: adjustedDrivingMinutes,
        },
      };
    });
  } catch (error) {
    throw new Error(`Error retrieving timecards: ${error.message}`);
  }
};

// Get employee summary report by employee ID, period, and date range
const getEmployeeSummaryById = async (
  employeeId,
  period,
  startDate,
  endDate
) => {
  try {
    let query;
    let params;

    // If the employeeId is "ALL", delegate the request to the getEmployeeSummaryForAll function
    if (employeeId === "ALL") {
      return getEmployeeSummaryForAll(period, startDate, endDate);
    }

    console.log(
      `Fetching employee summary for: ${employeeId}, Period: ${period}, Start: ${startDate}, End: ${endDate}`
    );

    const isAllEmployees = employeeId === "ALL";

    if (period === "weekly") {
      query = `
        SELECT 
          e.id AS employee_id,
          e.first_name,
          e.last_name,
          DATE_TRUNC('week', t.work_date) AS summary_period,
          SUM(
            CASE 
              WHEN (
                COALESCE(EXTRACT(EPOCH FROM t.facility_total_hours), 0) + 
                COALESCE(EXTRACT(EPOCH FROM t.driving_total_hours), 0)
              ) > 0 THEN 1 
              ELSE 0 
            END
          ) AS days_worked,
          COALESCE(SUM(EXTRACT(HOUR FROM t.facility_total_hours)), 0) AS facility_total_hours,
          COALESCE(SUM(EXTRACT(MINUTE FROM t.facility_total_hours)), 0) AS facility_total_minutes,
          COALESCE(SUM(EXTRACT(HOUR FROM t.driving_total_hours)), 0) AS driving_total_hours,
          COALESCE(SUM(EXTRACT(MINUTE FROM t.driving_total_hours)), 0) AS driving_total_minutes,
          5 - SUM(
            CASE 
              WHEN (
                COALESCE(EXTRACT(EPOCH FROM t.facility_total_hours), 0) + 
                COALESCE(EXTRACT(EPOCH FROM t.driving_total_hours), 0)
              ) > 0 THEN 1 
              ELSE 0 
            END
          ) AS absentee_days
        FROM employees e
        JOIN timecards t ON e.id = t.employee_id
        WHERE e.id = $1 AND t.work_date BETWEEN $2 AND $3
        GROUP BY e.id, e.first_name, e.last_name, summary_period
        ORDER BY summary_period;
      `;
      params = [employeeId, startDate, endDate];
    } else if (period === "monthly") {
      query = `
                SELECT 
    e.id AS employee_id,
    e.first_name,
    e.last_name,
    DATE_TRUNC('month', t.work_date) AS summary_period,
    SUM(
      CASE 
        WHEN (
          COALESCE((t.facility_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.facility_total_hours->>'minutes')::int, 0)*60 +
          COALESCE((t.driving_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.driving_total_hours->>'minutes')::int, 0)*60
        ) > 0 THEN 1 
        ELSE 0 
      END
    ) AS days_worked,
    COALESCE(SUM(COALESCE((t.facility_total_hours->>'hours')::int, 0)), 0) AS facility_total_hours,
    COALESCE(SUM(COALESCE((t.facility_total_hours->>'minutes')::int, 0)), 0) AS facility_total_minutes,
    COALESCE(SUM(COALESCE((t.driving_total_hours->>'hours')::int, 0)), 0) AS driving_total_hours,
    COALESCE(SUM(COALESCE((t.driving_total_hours->>'minutes')::int, 0)), 0) AS driving_total_minutes,
    20 - SUM(
      CASE 
        WHEN (
          COALESCE((t.facility_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.facility_total_hours->>'minutes')::int, 0)*60 +
          COALESCE((t.driving_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.driving_total_hours->>'minutes')::int, 0)*60
        ) > 0 THEN 1 
        ELSE 0 
      END
    ) AS absentee_days
FROM employees e
JOIN timecards t ON e.id = t.employee_id
WHERE e.id = $1 AND t.work_date BETWEEN $2 AND $3
GROUP BY e.id, e.first_name, e.last_name, summary_period
ORDER BY summary_period;
            `;
      params = isAllEmployees
        ? [startDate, endDate]
        : [employeeId, startDate, endDate];
    } else if (period === "yearly") {
      query = `
                SELECT 
    e.id AS employee_id,
    e.first_name,
    e.last_name,
    DATE_TRUNC('year', t.work_date) AS summary_period,
    SUM(
      CASE 
        WHEN (
          COALESCE((t.facility_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.facility_total_hours->>'minutes')::int, 0)*60 +
          COALESCE((t.driving_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.driving_total_hours->>'minutes')::int, 0)*60
        ) > 0 THEN 1 
        ELSE 0 
      END
    ) AS days_worked,
    COALESCE(SUM(COALESCE((t.facility_total_hours->>'hours')::int, 0)), 0) AS facility_total_hours,
    COALESCE(SUM(COALESCE((t.facility_total_hours->>'minutes')::int, 0)), 0) AS facility_total_minutes,
    COALESCE(SUM(COALESCE((t.driving_total_hours->>'hours')::int, 0)), 0) AS driving_total_hours,
    COALESCE(SUM(COALESCE((t.driving_total_hours->>'minutes')::int, 0)), 0) AS driving_total_minutes,
    240 - SUM(
      CASE 
        WHEN (
          COALESCE((t.facility_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.facility_total_hours->>'minutes')::int, 0)*60 +
          COALESCE((t.driving_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.driving_total_hours->>'minutes')::int, 0)*60
        ) > 0 THEN 1 
        ELSE 0 
      END
    ) AS absentee_days
FROM employees e
JOIN timecards t ON e.id = t.employee_id
WHERE e.id = $1 AND t.work_date BETWEEN $2 AND $3
GROUP BY e.id, e.first_name, e.last_name, summary_period
ORDER BY summary_period;

            `;
      params = isAllEmployees
        ? [startDate, endDate]
        : [employeeId, startDate, endDate];
    } else {
      throw new Error("Invalid period specified");
    }

    const result = await db.any(query, params);
    console.log(result);

    // Adjust to return hours and minutes instead of decimal values
    return result.map((entry) => {
      const facilityTotalHours = parseInt(entry.facility_total_hours, 10) || 0;
      const facilityTotalMinutes =
        parseInt(entry.facility_total_minutes, 10) || 0;
      const drivingTotalHours = parseInt(entry.driving_total_hours, 10) || 0;
      const drivingTotalMinutes =
        parseInt(entry.driving_total_minutes, 10) || 0;

      // Adjust minutes into hours for facility
      const adjustedFacilityHours =
        facilityTotalHours + Math.floor(facilityTotalMinutes / 60);
      const remainingFacilityMinutes = facilityTotalMinutes % 60;

      // Adjust minutes into hours for driving
      const adjustedDrivingHours =
        drivingTotalHours + Math.floor(drivingTotalMinutes / 60);
      const remainingDrivingMinutes = drivingTotalMinutes % 60;

      return {
        employee_id: entry.employee_id,
        first_name: entry.first_name,
        last_name: entry.last_name,
        summary_period: entry.summary_period,
        days_worked: entry.days_worked,
        absentee_days: entry.absentee_days,
        facility_total_hours: {
          hours: adjustedFacilityHours,
          minutes: remainingFacilityMinutes,
        },
        driving_total_hours: {
          hours: adjustedDrivingHours,
          minutes: remainingDrivingMinutes,
        },
      };
    });
  } catch (error) {
    console.error(`Error in getEmployeeSummaryReport: ${error.message}`);
    throw new Error(
      `Error retrieving employee summary report: ${error.message}`
    );
  }
};

// Get employee summary report for all employees, by period and date range
const getEmployeeSummaryForAll = async (period, startDate, endDate) => {
  try {
    let query;
    let params;

    console.log(
      `Fetching employee summary for ALL employees, Period: ${period}, Start: ${startDate}, End: ${endDate}`
    );

    if (period === "weekly") {
      query = `
        SELECT 
          e.id AS employee_id,
          e.first_name,
          e.last_name,
          DATE_TRUNC('week', t.work_date) AS summary_period,
          SUM(
            CASE 
              WHEN (
                COALESCE(EXTRACT(EPOCH FROM t.facility_total_hours), 0) +
                COALESCE(EXTRACT(EPOCH FROM t.driving_total_hours), 0)
              ) > 0 THEN 1 
              ELSE 0 
            END
          ) AS days_worked,
          COALESCE(SUM(EXTRACT(HOUR FROM t.facility_total_hours)), 0) AS facility_total_hours,
          COALESCE(SUM(EXTRACT(MINUTE FROM t.facility_total_hours)), 0) AS facility_total_minutes,
          COALESCE(SUM(EXTRACT(HOUR FROM t.driving_total_hours)), 0) AS driving_total_hours,
          COALESCE(SUM(EXTRACT(MINUTE FROM t.driving_total_hours)), 0) AS driving_total_minutes,
          5 - SUM(
            CASE 
              WHEN (
                COALESCE(EXTRACT(EPOCH FROM t.facility_total_hours), 0) +
                COALESCE(EXTRACT(EPOCH FROM t.driving_total_hours), 0)
              ) > 0 THEN 1 
              ELSE 0 
            END
          ) AS absentee_days
        FROM employees e
        JOIN timecards t ON e.id = t.employee_id
        WHERE t.work_date BETWEEN $1 AND $2
        GROUP BY e.id, e.first_name, e.last_name, summary_period
        ORDER BY summary_period;
      `;
      params = [startDate, endDate];
    } else if (period === "monthly") {
      query = `
                SELECT 
    e.id AS employee_id,
    e.first_name,
    e.last_name,
    DATE_TRUNC('month', t.work_date) AS summary_period,
    SUM(
      CASE 
        WHEN (
          COALESCE((t.facility_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.facility_total_hours->>'minutes')::int, 0)*60 +
          COALESCE((t.driving_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.driving_total_hours->>'minutes')::int, 0)*60
        ) > 0 THEN 1 
        ELSE 0 
      END
    ) AS days_worked,
    COALESCE(SUM(COALESCE((t.facility_total_hours->>'hours')::int, 0)), 0) AS facility_total_hours,
    COALESCE(SUM(COALESCE((t.facility_total_hours->>'minutes')::int, 0)), 0) AS facility_total_minutes,
    COALESCE(SUM(COALESCE((t.driving_total_hours->>'hours')::int, 0)), 0) AS driving_total_hours,
    COALESCE(SUM(COALESCE((t.driving_total_hours->>'minutes')::int, 0)), 0) AS driving_total_minutes,
    20 - SUM(
      CASE 
        WHEN (
          COALESCE((t.facility_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.facility_total_hours->>'minutes')::int, 0)*60 +
          COALESCE((t.driving_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.driving_total_hours->>'minutes')::int, 0)*60
        ) > 0 THEN 1 
        ELSE 0 
      END
    ) AS absentee_days
FROM employees e
JOIN timecards t ON e.id = t.employee_id
WHERE t.work_date BETWEEN $1 AND $2
GROUP BY e.id, e.first_name, e.last_name, summary_period
ORDER BY summary_period;

            `;
      params = [startDate, endDate];
    } else if (period === "yearly") {
      query = `
                SELECT 
    e.id AS employee_id,
    e.first_name,
    e.last_name,
    DATE_TRUNC('year', t.work_date) AS summary_period,
    SUM(
      CASE 
        WHEN (
          COALESCE((t.facility_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.facility_total_hours->>'minutes')::int, 0)*60 +
          COALESCE((t.driving_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.driving_total_hours->>'minutes')::int, 0)*60
        ) > 0 THEN 1 
        ELSE 0 
      END
    ) AS days_worked,
    COALESCE(SUM(COALESCE((t.facility_total_hours->>'hours')::int, 0)), 0) AS facility_total_hours,
    COALESCE(SUM(COALESCE((t.facility_total_hours->>'minutes')::int, 0)), 0) AS facility_total_minutes,
    COALESCE(SUM(COALESCE((t.driving_total_hours->>'hours')::int, 0)), 0) AS driving_total_hours,
    COALESCE(SUM(COALESCE((t.driving_total_hours->>'minutes')::int, 0)), 0) AS driving_total_minutes,
    240 - SUM(
      CASE 
        WHEN (
          COALESCE((t.facility_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.facility_total_hours->>'minutes')::int, 0)*60 +
          COALESCE((t.driving_total_hours->>'hours')::int, 0)*3600 +
          COALESCE((t.driving_total_hours->>'minutes')::int, 0)*60
        ) > 0 THEN 1 
        ELSE 0 
      END
    ) AS absentee_days
FROM employees e
JOIN timecards t ON e.id = t.employee_id
WHERE t.work_date BETWEEN $1 AND $2
GROUP BY e.id, e.first_name, e.last_name, summary_period
ORDER BY summary_period;

            `;
      params = [startDate, endDate];
    } else {
      throw new Error("Invalid period specified");
    }

    const result = await db.any(query, params);
    console.log(result);

    return result.map((entry) => {
      // Normalize facility_total_hours
      let facilityData;
      if (
        typeof entry.facility_total_hours === "object" &&
        entry.facility_total_hours !== null
      ) {
        facilityData = {
          hours: parseInt(entry.facility_total_hours.hours, 10) || 0,
          minutes: parseInt(entry.facility_total_hours.minutes, 10) || 0,
        };
      } else {
        facilityData = {
          hours: parseInt(entry.facility_total_hours, 10) || 0,
          minutes: parseInt(entry.facility_total_minutes, 10) || 0,
        };
      }

      // Normalize driving_total_hours
      let drivingData;
      if (
        typeof entry.driving_total_hours === "object" &&
        entry.driving_total_hours !== null
      ) {
        drivingData = {
          hours: parseInt(entry.driving_total_hours.hours, 10) || 0,
          minutes: parseInt(entry.driving_total_hours.minutes, 10) || 0,
        };
      } else {
        drivingData = {
          hours: parseInt(entry.driving_total_hours, 10) || 0,
          minutes: parseInt(entry.driving_total_minutes, 10) || 0,
        };
      }

      // Adjust minutes into hours
      const adjustedFacilityHours =
        facilityData.hours + Math.floor(facilityData.minutes / 60);
      const remainingFacilityMinutes = facilityData.minutes % 60;

      const adjustedDrivingHours =
        drivingData.hours + Math.floor(drivingData.minutes / 60);
      const remainingDrivingMinutes = drivingData.minutes % 60;

      return {
        employee_id: entry.employee_id,
        first_name: entry.first_name,
        last_name: entry.last_name,
        summary_period: entry.summary_period,
        days_worked: entry.days_worked,
        absentee_days: entry.absentee_days,
        facility_total_hours: {
          hours: adjustedFacilityHours,
          minutes: remainingFacilityMinutes,
        },
        driving_total_hours: {
          hours: adjustedDrivingHours,
          minutes: remainingDrivingMinutes,
        },
      };
    });
  } catch (error) {
    console.error(`Error in getEmployeeSummaryReport: ${error.message}`);
    throw new Error(
      `Error retrieving employee summary report: ${error.message}`
    );
  }
};

module.exports = {
  getTotalHoursWorkedByEmployeeByDateRange,
  getTotalHoursWorkedByAllEmployeesByDateRange,
  getDetailedTimecardsByEmployee,
  getEmployeeSummaryById,
  getEmployeeSummaryForAll,
};
