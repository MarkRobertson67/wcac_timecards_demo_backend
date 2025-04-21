// Proprietary Software License
// Copyright (c) 2024 Mark Robertson
// See LICENSE.txt file for details.

require("dotenv").config(); // Load environment variables from .env file
const pgp = require("pg-promise")();

// Ensure the connection string is available in the environment variables
const connectionString = process.env.DB_URL;
if (!connectionString) {
  throw new Error("No connection string; did you set process.env.DB_URL?");
}

// Configure the connection options
const cn = {
  connectionString,
  allowExitOnIdle: true, // Allow the connection to exit when idle
  max: 30, // Maximum number of connections in the pool
};

// Initialize the pg-promise instance with the connection options
const db = pgp(cn);

module.exports = db; // Export the database instance for use in other modules
