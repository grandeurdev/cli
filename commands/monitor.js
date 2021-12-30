// Upload command will compile the code
// and upload it to board

// Import libraries
// To build prompt
const inquirer = require('inquirer');

// Library for logging
const log = require("./utils/log");

// Import exec to run arduino commands
const arduino = require("./utils/exec");

// Export a function, which will be passed to commander
module.exports = async function() {
    // In a try catch
    try {
        // List all connected boards
        var boards = await arduino(["board", "list"]);

        // Convert to json
        boards = JSON.parse(boards);

        // Formulate arrays for ports and board names
        var ports = [];

        // Filter ports and remove non usb serial ports
        for (var board of boards) {
            // Continue if it is not a valid port
            if (board.port.protocol_label !== "Serial Port (USB)") continue;

            // Push port and label to respective array
            ports.push(board.port.address);
        }

        // If a board is not connected than throw an error
        if (ports.length === 0) {

            // Display message
            log.info("Connect a board to continue");

            // And exit
            throw {};
        }

        // Then display the list
        const answers = await inquirer.prompt([{

            // Ask for the port
            message: "Please select your board",
            type: "list",
            choices: ports,
            name: "port"
            
        }]);
        
        // Get port
        const port = answers.port;

        // Attach monitor
        log.info("Attaching to port", "both");

        // Use arduino
        await arduino(["monitor", "-p", port], true);
    } 
    catch (error) {
        // Handle case where sketch already exists
        if (error.code === "ENOENT") log.info("Invalid sketch directory.", "start");
        
        // Throw the error
        log.error("Failed to upload sketch", "end");
    }
}