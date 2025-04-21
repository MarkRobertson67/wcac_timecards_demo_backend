// Proprietary Software License
// Copyright (c) 2024 Mark Robertson
// See LICENSE.txt file for details.



const express = require("express");
const path = require("path");
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 4000;

// Serve static files from the React build folder
const buildPath = path.join(__dirname, "build");
app.use(express.static(buildPath));

// Set Cache-Control headers for index.html to prevent caching
app.get("/", (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.join(buildPath, "index.html"));
});

// React Router fallback for SPA (e.g., for /timeCardIndex or /timeCardDetails)
app.get("*", (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.join(buildPath, "index.html"));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
