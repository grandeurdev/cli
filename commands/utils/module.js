// To install module

// Import libraries
// For loader
const ora = require("ora");

// To build prompt
const inquirer = require('inquirer');

// Library for logging
const log = require("./log");

// To execute arduino commands
const arduino = require("./exec");

// Function to check library version
async function version(library) {

    // Get the library details
    var libs = await arduino([ "lib", "list" ]);

    // Convert to json
    libs = JSON.parse(libs);

    // Convert library name to lower case
    library = library.toLowerCase();

    // Loop over lib list to get library version
    for (var lib of libs) {
        
        // Validate with id
        if (lib.library.real_name.toLowerCase() === library) 

            // Then resolve the promise with library version
            return {
                version: lib.library.version,
                name: lib.library.real_name
            }
    }

    // Library not found. Return null
    return null
}

// Export a function, which will be passed to commander
module.exports = async function(name, debug, search) {

    // In a try catch
    try {
        // If search is required
        if (search) {

            // Then we are gonna give user a way to select right lib
            // We want to help user find right library
            var libs = await arduino([ "lib", "search", name ]);

            // Covert to json
            libs = JSON.parse(libs).libraries;

            // Create list of suggested library names
            var names = libs.map( lib => lib.name );

            // Ask for selection from user
            var { name } = await inquirer.prompt([{

                // Ask for the port
                message: "Select the module to install",
                type: "search",
                choices: names,
                name: "name"

            }]);
            
        }

        // Then make sure that the library is not already installed
        var library = await version(name);

        // If a library version was returned then resolve
        if (library) return library;

        // Otherwise install the library
        // Log message
        log.info(`Installing module ${name}`, "both");

        // And start loading if not in debug mode
        if (!debug) var loading = ora("Downloading module").start();

        // We will use arduino to install grandeur
        await arduino([ "lib", "install", name ], debug);

        // Then end loading
        if (!debug) loading.succeed("Download completed.");

        // Get library version
        var library = await version(name);

        // and resolve
        return library
    } 
    catch (error) {
        // Throw to parent
        throw error
    }
}
