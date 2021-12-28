// Init sub command will provide a npm like init
// flow to user. We will ask for sketch name,
// architecture and target to create a new sketch folder
// with arduino file and pakcage.json file

// Import libraries
// To build prompt
const inquirer = require('inquirer');

// To display welcome screen
const figlet = require("figlet");

// Library for logging
const log = require("./utils/log");

// Library to handle arduino installation
const arduino = require("./utils/arduino");

// Export a function, which will be passed to commander
module.exports = async function() {
    // In a try catch
    try {
        // Generate logo
        log.raw(figlet.textSync("Grandeur", { font: "Slant" }));

        // Then log info message
        log.raw("This utility will walk you through creating a new sketch.");
        log.raw("Press ^C anytime to quit.\n\n");

        // Start the wizard
        const answers = await inquirer.prompt([{

            // Ask for sketch name
            message: "Sketch name:",
            name: "name"

        }, {

            // Then ask for the architecture
            message: "Please select an architecture",
            type: "list",
            choices: ["esp8266", "esp32"],
            name: "arch"
            
        }]);

        // Validate that the arduino is installed
        await arduino();
    } 
    catch (error) {
        // Throw the error
        log.error("Failed to create new sketch");
    }
}
