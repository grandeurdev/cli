// Monitor command will attach to a serial

// Import libraries
// To build prompt
const inquirer = require('inquirer');

// Library for logging
const log = require("./utils/log");

// Import exec to run arduino commands
const arduino = require("./utils/exec");

// Library to get ports
const boards = require("./utils/ports");

// Export a function, which will be passed to commander
module.exports = async function() {
    // In a try catch
    try {
        // List all connected boards
        const { ports, addresses, keywords, suggestions } = await boards();

        // Then display the list
        var { port } = await inquirer.prompt([{

            // Ask for the port
            message: "Please select your board",
            type: "list",
            choices: addresses,
            name: "port"
            
        }]);
        
        // Check if the selection is from the suggested key
        if (keywords.includes(port)) {

            // Then get the port address and fbqn from options
            var { address } = ports[addresses.indexOf(port)];

            // Then replace the suggestion with address and extract fbqn
            port = address;

        }

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