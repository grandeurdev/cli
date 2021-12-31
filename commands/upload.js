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

// Library to get boards
const boards = require("./utils/ports");

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

        // Get ports and addresses labels
        const { ports, addresses, keywords, suggestions } = await boards();

        // Ask for port selection from user
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
            var { address, fqbn } = ports[addresses.indexOf(port)];

            // Then replace the suggestion with address and extract fbqn
            port = address;

        }
        else {

            // Get board selection from user
            // Get cores
            var cores = await arduino(["core", "list"]);

            // Parse cores
            cores = JSON.parse(cores);

            // Object to store targets
            var targets;
            var labels = [];

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
            var { target } = await inquirer.prompt([{

                // Then ask for the target
                message: "Specify the board name of selected port",
                type: "search",
                choices: labels,
                name: "target"
                
            }]);

            // Get vid pid pair based on port address
            const { properties } = ports[addresses.indexOf(port)];

            // Replace board target label with fqbn
            var { fqbn } = targets[labels.indexOf(target)];

            // Take the properties and fqbn and add to suggestions
            // Write back
            await suggestions(properties.pid + properties.vid, {
                fqbn: fqbn,
                name: target
            });

        }

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