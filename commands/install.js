// Upload command will compile the code
// and upload it to board

// Import libraries
// Library for logging
const log = require("./utils/log");

// To handle directory
const fs = require("fs").promises;

// To handle path
const path = require("path");

// To install library
const library = require("./utils/module");

// Export a function, which will be passed to commander
module.exports = async function(name) {
    // In a try catch
    try {
        // Open the package file
        var sketch = await fs.readFile(path.join(process.cwd(), "package.json"));

        // Parse sketch data
        sketch = JSON.parse(sketch);

        // If module name is provided
        if (name) {

            // Take the library name and install
            // Always install latest
            const lib = await library(name.split("@")[0], true);

            // Take lib name and update packages
            sketch.dependencies[lib.name] = "@" + lib.version;

            // Update packages
            await fs.writeFile(path.join(process.cwd(), "package.json"), JSON.stringify(sketch, null, 4));

            // Log message
            log.success("Module installed successfully", "both");

        }
        else {
            // Resolve dependencies
            for (var lib of Object.keys(sketch.dependencies)) {

                // Install library
                await library(lib, true);

            }

            // Log message
            log.success("Dependencies resolved successfully", "both");
        }

    } 
    catch (error) {
        // Handle case where sketch already exists
        if (error.code === "ENOENT") log.info("Invalid sketch directory.", "start");
        
        // Throw the error
        log.error("Failed to install library", "end");
    }
}