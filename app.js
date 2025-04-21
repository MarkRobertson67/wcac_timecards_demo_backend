// Proprietary Software License
// Copyright (c) 2024 Mark Robertson
// See LICENSE.txt file for details.

// DEPENDENCIES
const express = require("express");
const cors = require("cors");
const morgan = require('morgan');


const corsOptions = {
    origin: [
        "https://wcac-timecards.netlify.app", // Production frontend
        "http://localhost:3000" // Local development frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};


// CONFIGURATION
const app = express();

// MIDDLEWARE
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));


//Controllers
const employeesController = require("./controllers/EmployeeController");
const timecardsController = require("./controllers/TimecardController");
const reportsController = require("./controllers/ReportController");


// ROUTES
// Example routes using controllers
app.use("/employees", employeesController);
app.use("/timecards", timecardsController);
app.use("/reports", reportsController);


// HEALTH CHECK ROUTE
app.get("/", (req, res) => {
    const htmlContent = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
            <p style="text-align: center; font-size: 24px;">
                Welcome to the We Care Adult Care Timecards <strong>Back-end</strong>
            </p>
        </div>
    `;
    
    // Send the HTML content as the response
    res.send(htmlContent);
    // res.json({ message: "Welcome to the We Care Adult Care Timecards **Back-end**" });
}
);

// NOT FOUND ROUTE
app.get("*", (req, res) => {
    res.status(404).json({ message: "Page Not Found" });
});


module.exports = app;