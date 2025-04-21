// Proprietary Software License
// Copyright (c) 2025 Mark Robertson
// See LICENSE.txt file for details.

const db = require("../db/dbConfig");


//Get All Employees
const getAllEmployees = async () => {
  try {
    const employees = await db.any("SELECT * FROM employees ORDER BY id ASC");
    return employees;
  } catch (error) {
    console.error("Error retrieving all employees:", error);
    throw new Error("Unable to retrieve employee data.");
  }
};


// Get employee by ID
const getEmployeeById = async (id) => {
  try {
    const employee = await db.oneOrNone("SELECT * FROM employees WHERE id = $1", [id]);
    if (!employee) {
      throw new Error(`No employee found with ID ${id}`);
    }
    return employee;
  } catch (error) {
    console.error(`Error retrieving employee with ID ${id}:`, error);
    throw new Error(`Unable to retrieve employee with ID ${id}`);
  }
};


// Get employee by Firebase UID
const getEmployeeByFirebaseUid = async (firebase_uid) => {
  try {
    console.log("Fetching employee with Firebase UID:", firebase_uid);
    const employee = await db.oneOrNone("SELECT * FROM employees WHERE firebase_uid = $1", [firebase_uid]);
    if (!employee) {
      console.log("No employee found with Firebase UID:", firebase_uid);
      return null; // Return null if no employee is found
    }
    return employee;
  } catch (error) {
    console.error(`Error retrieving employee with Firebase UID ${firebase_uid}:`, error.message);
    throw new Error(`Unable to retrieve employee with Firebase UID ${firebase_uid}`);
  }
};




// Create a new employee
const createEmployee = async (firebase_uid, first_name, last_name, email, phone, position) => {
  try {
    const newEmployee = await db.one(
      "INSERT INTO employees (firebase_uid, first_name, last_name, email, phone, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [firebase_uid, first_name, last_name, email, phone, position]
    );
    return newEmployee;
  } catch (error) {
    console.error("Error creating new employee:", error);
    throw new Error(`Error creating new employee: ${error.message}`);
  }
};


// Update an employee by ID
const updateEmployee = async (id, { first_name, last_name, email, phone, position, paychex_id, is_admin }) => {
  try {
    // Ensure is_admin is always either true or false, never null
    if (is_admin === undefined || is_admin === null) {
      is_admin = false; // Set default value to false if not provided
    }

    const updatedEmployee = await db.oneOrNone(
      "UPDATE employees SET first_name = $1, last_name = $2, email = $3, phone = $4, position = $5, paychex_id = $6, is_admin = $7 WHERE id = $8 RETURNING *",
      [first_name, last_name, email, phone, position, paychex_id, is_admin, id]
    );

    if (!updatedEmployee) {
      throw new Error(`Employee with ID ${id} not found.`);
    }
    return updatedEmployee;
  } catch (error) {
    console.error(`Error updating employee with ID ${id}:`, error);
    throw new Error(`Error updating employee: ${error.message}`);
  }
};


// Delete an employee by ID
const deleteEmployee = async (id) => {
  try {
    const deletedEmployee = await db.one(
      "DELETE FROM employees WHERE id = $1 RETURNING *",
      [id]
    );
    if (!deletedEmployee) {
      throw new Error(`Employee with ID ${id} not found.`);
    }
    return deletedEmployee;
  } catch (error) {
    console.error(`Error deleting employee with ID ${id}:`, error);
    throw new Error(`Error deleting employee: ${error.message}`);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  getEmployeeByFirebaseUid,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
