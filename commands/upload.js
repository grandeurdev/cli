// Upload command will compile the code
// and upload it to board

// Import libraries
// To build prompt
const inquirer = require('inquirer');

// Attach search list to inquirer
inquirer.registerPrompt("search", require("inquirer-search-list"));

// Library for logging
const log = require("./utils/log");

// To handle directory
const fs = require("fs").promises;

// To handle path
const path = require("path");

// Import exec to run arduino commands
const arduino = require("./utils/exec");

// Export a function, which will be passed to commander
module.exports = async function() {
    // In a try catch
    try {
        // Open the package file
        var sketch = await fs.readFile(path.join(process.cwd(), "package.json"));

        // Parse sketch data
        sketch = JSON.parse(sketch);

        // Get arch name
        const arch = sketch.arch.split("@")[0];

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

        // Get cores
        var cores = await arduino(["core", "list"]);

        // Parse cores
        cores = JSON.parse(cores);

        // Object to store targets
        var targets;
        var labels = []

        // Loop over cores to get targets
        for (var core of cores) {
            // Match id
            if (core.id === arch) {

                // Set targets
                targets = core.boards;

                // Then loop over core to filter data
                for (var target of core.boards) {
                    // Push names to lables
                    labels.push(target.name);
                }

                // Break loop
                break;
            }
        }

        // Then display the list
        const answers = await inquirer.prompt([{

            // Ask for the port
            message: "Please select your board",
            type: "list",
            choices: ports,
            name: "port"
            
        }, {

            // Then ask for the target
            message: "Specify the board name of selected port",
            type: "search",
            choices: labels,
            name: "target"
            
        }]);
        
        // Get port
        const port = answers.port;

        // Replace board target label with fqbn
        const { fqbn } = targets.find( (target) => target.name === answers.target );

        // Dipslay message
        log.info("Compilation started", "both");

        // Compile and upload
        await arduino(["compile", "-b", fqbn, "-p", port, "-u"], true);

        // Display success
        log.success("Sketch uploaded", "both");

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