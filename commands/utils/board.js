// To verify board installation

// Import libraries
// For loader
const ora = require("ora");

// Library for logging
const log = require("./log");

// To execute arduino commands
const arduino = require("./exec");

// Export a function, which will be passed to commander
module.exports = async function(board, debug) {

    // In a try catch
    try {
        // We will use arduino dependency to get list of installed baords
        var boards = await arduino([ "core", "list" ]);

        // Parse board data
        boards = JSON.parse(boards);

        // Get board id
        const boardID = board.split("@")[0];

        // Validate that the board is installed
        for (var brd of boards) {
            
            // Validate with id
            if (brd.id === boardID) 
                // Then resolve the promise
                return brd
        }
        
        // Log message
        log.info("Downloading board", "both");

        // Start installing
        const loading = !debug ? ora("This may take a while").start() : null;

        // Board is not installed
        // Install the board
        await arduino([ "core", "install", board ], debug);

        // Then end loading
        !debug ? loading.succeed("Download completed.") : log.success("Download completed.");
    } 
    catch (error) {
        // Throw to parent
        throw error
    }
}
