// To install module

// Import libraries
// For loader
const ora = require("ora");

// Library for logging
const log = require("./log");

// To execute arduino commands
const arduino = require("./exec");

// Function to check library version
async function version(library) {

    // Get the library details
    var libs = await arduino([ "lib", "list", library ]);

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
module.exports = async function(name, debug) {

    // In a try catch
    try {
        // First make sure that the library is not already installed
        var library = await version(name.split("@")[0]);

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
        var library = await version(name.split("@")[0]);

        // and resolve
        return library
    } 
    catch (error) {
        // Throw to parent
        throw error
    }
}
