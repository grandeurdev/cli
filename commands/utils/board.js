// To verify board installation

// Import libraries
// To handle arduino commands
const { execFile } = require("child_process");

// For path handling
const path = require("path");

// To get home dir
const os = require("os");

// For loader
const ora = require("ora");

// Library for logging
const log = require("./log");

// Function to promisify the exec
function exec(commands, options) {

    // Grandeur directory
    const home = path.join(os.homedir(), ".grandeur");

    // Return new promise
    return new Promise(( resolve, reject ) => {

        // Then run the command and handle response
        execFile(path.join(home, "/tools/arduino-cli"), commands, { cwd: process.cwd() }, (err, stdout, stderr) => {
            // Reject if error
            if (err) reject(err);

            // Otherwise resolve with response
            resolve(stdout);
        })

    });

}

// Export a function, which will be passed to commander
module.exports = async function(board) {
    // Grandeur directory
    const home = path.join(os.homedir(), ".grandeur");

    // In a try catch
    try {
        // We will use arduino dependency to get list of installed baords
        var boards = await exec([

            // List all installed boards
            "core", "list", 

            // Provide config file
            "--config-file", home + "/tools/arduino-cli.json", 

            // Output in json
            "--format", "json"

        ]);

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
        log.info("Board dependency not found!", "both");

        // Start installing
        const loading = ora("Downloading. This may take a while").start();

        // Board is not installed
        // Install the board
        await exec([

            // List all installed boards
            "core", "install", board,

            // Provide config file
            "--config-file", home + "/tools/arduino-cli.json", 

            // Output in json
            "--format", "json"

        ]);

        // Then end loading
        loading.succeed("Download completed.");
    } 
    catch (error) {
        // Throw to parent
        throw error
    }
}
