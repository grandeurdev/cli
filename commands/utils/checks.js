// To run checklist

// Import libraries

// Library to handle arduino installation
const arduino = require("./arduino");

// Library to manage board
const board = require("./board");

// To install Grandeur library
const library = require("./module");

// Export a function, which will be passed to commander
module.exports = async function(arch, debug) {

    // In a try catch
    try {
        // We will just make some checks

        // Validate that the arduino is installed
        await arduino();

        // Validate that board is installed
        await board(arch, debug);

        // Install grandeur
        var lib = await library("grandeur", debug);

        // And return library information
        return lib;
    } 
    catch (error) {
        // Throw to parent
        throw error
    }
}
