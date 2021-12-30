// Upload command will compile the code
// and upload it to board

// Import libraries
// To build prompt
const inquirer = require('inquirer');

// Library for logging
const log = require("./utils/log");

// To handle directory
const fs = require("fs").promises;

// To handle path
const path = require("path");

// Export a function, which will be passed to commander
module.exports = async function() {
    // In a try catch
    try {
        // Open the package file
        


    } 
    catch (error) {
        // Handle case where sketch already exists
        if (error.code === "EEXIST") log.info("Sketch with a similar name already exists in this folder", "start");
        
        // Throw the error
        log.error("Failed to create new sketch", "end");
    }
}