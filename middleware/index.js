// Proprietary Software License
// Copyright (c) 2024 Mark Robertson
// See LICENSE.txt file for details.

const { getEmployeeById } = require("../queries/EmployeeQueries");
const { getTimecardById } = require("../queries/TimecardQueries");

const { isISO8601, escape, normalizeEmail } = require('validator');

const sanitizeInput = (input) => {
  return escape(input);
};


// Validate ID
const validateIdMiddleware = (request, response, next) => {
  let { id } = request.params;
  id = sanitizeInput(id); // Sanitize input
  if (!Number.isInteger(Number(id)) || Number(id) < 1) {
    return response.status(400).json({ error: `id param must be a positive integer; received ${id}` });
  } else {
    request.id = Number(id);
    next();
  }
};

//Validate Employee exists
const validateEmployeeExistsMiddleware = async (request, response, next) => {
  const { id } = request;
  const employee = await getEmployeeById(id);
  if (!employee) {
    return response
      .status(404)
      .json({ error: `Cannot find employee with id ${id}` });
  }
  request.employee = employee;
  next();
};

//Validate Time card Exists
const validateTimecardExistsMiddleware = async (request, response, next) => {
  const { id } = request;
  const timecard = await getTimecardById(id);
  if (!timecard) {
    return response
      .status(404)
      .json({ error: `Cannot find timecard with id ${id}` });
  }
  request.timecard = timecard;
  next();
};

//Validate that Time Card is Editable (not Submitted)
const validateTimecardEditableMiddleware = async (request, response, next) => {
  const { timecard } = request;
  if (timecard.status === 'submitted' || timecard.status === 'locked') {
    return response.status(403).json({ error: "This timecard has been locked and cannot be modified." });
  }
  next();
};

// Validate Date Range
const validateDateRangeMiddleware = (request, response, next) => {
  const { startDate, endDate } = request.query;
  
  console.log(`Received Start Date: ${startDate}, End Date: ${endDate}`);
  
  // Check if both startDate and endDate are provided and valid dates
  if (!startDate || !endDate || !isValidDate(startDate) || !isValidDate(endDate)) {
    return response
      .status(400)
      .json({ error: "Invalid date range. Both startDate and endDate must be valid dates." });
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return response.status(400).json({ error: "startDate must not be later than endDate." });
  }
  
  next();
};


//Validate Date Format
const validateDateMiddleware = (request, response, next) => {
  const { date } = request.params;
  if (!isValidDate(date)) {
    return response.status(400).json({ error: `Invalid date format: ${date}` });
  }
  next();
};


const isValidDate = (dateString) => {
  // Simple date validation example; adjust based on your date format requirements
  console.log(dateString)
  return !isNaN(Date.parse(dateString));
};


// Validate Email Format
const validateEmployeeEmail = (email) => {
  const sanitizedEmail = normalizeEmail(email);
  if (!sanitizedEmail) {
    throw new Error('Invalid email format.');
  }
  return sanitizedEmail;
};


module.exports = {
  validateIdMiddleware,
  validateEmployeeExistsMiddleware,
  validateTimecardExistsMiddleware,
  validateTimecardEditableMiddleware,
  validateDateRangeMiddleware,
  validateDateMiddleware,
  validateEmployeeEmail,
};
