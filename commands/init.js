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

// To handle directory
const fs = require("fs").promises;

// To handle path
const path = require("path");

// Library to handle arduino installation
const arduino = require("./utils/arduino");

// Library to manage board
const board = require("./utils/board");

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
            message: "Please select the architecture",
            type: "list",
            choices: ["esp8266", "esp32"],
            name: "arch"
            
        }]);

        // Validate that the arduino is installed
        await arduino();

        // Validate that board is installed
        await board(answers.arch === "esp8266" ? "esp8266:esp8266@3.0.2" : "esp32:esp32@2.0.2");

        // Workspace folder url
        const workspace = path.join(process.cwd(), answers.name);

        // Then create the workspace folder in cwd
        await fs.mkdir(workspace);

        // Then create the sketch main file in it
        await fs.writeFile(path.join(workspace, answers.name + ".ino"), `
 
// the setup function runs once when you press reset or power the board
void setup() {

}

// the loop function runs over and over again forever
void loop() {

}
        `);

        // Fin create the packages file
        await fs.writeFile(path.join(workspace, "package.json"), JSON.stringify({
            "name": answers.name,
            "version": "1.0.0",
            "description": "",
            "main": `${answers.name}.ino`,
            "author": "",
            "license": "ISC",
            "dependencies": {
                
            },
            "arch": answers.arch
        }, null, 4));

        // Log message
        log.success("Done!", "both");
    } 
    catch (error) {
        // Handle case where sketch already exists
        if (error.code === "EEXIST") log.info("Sketch with a similar name already exists in this folder");
        
        // Throw the error
        log.error("Failed to create new sketch");
    }
}
