// Monitor command will attach to a serial

// Import libraries
// To build prompt
const inquirer = require('inquirer');

// Library for logging
const log = require("./utils/log");

// Import exec to run arduino commands
const arduino = require("./utils/exec");

// Library to get ports
const boards = require("./utils/boards");

// Export a function, which will be passed to commander
module.exports = async function() {
    // In a try catch
    try {
        // List all connected boards
        const { port } = await boards();

        // Attach monitor
        log.info("Attaching to port", "both");

        // Use arduino
        await arduino(["monitor", "-p", port], true);
    } 
    catch (error) {
        // Throw the error
        log.error("Failed to open serial port", "end");
    }
}