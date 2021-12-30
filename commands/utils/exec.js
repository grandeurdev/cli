// Module to provide promise interface on exec

// To handle arduino commands
const { execFile } = require("child_process");

// For path handling
const path = require("path");

// To get home dir
const os = require("os");

// Function to promisify the exec
module.exports = function exec(args, debug) {

    // Grandeur directory
    const home = path.join(os.homedir(), ".grandeur");

    // Setup commands
    const core = [

        // Provide config file
        "--config-file", home + "/tools/arduino-cli.json", 

        // Output in json
        "--format", debug ? "text" : "json"

    ];

    // Append the core commands to the array provided by user
    const commands = args.concat(core);

    // Return new promise
    return new Promise(( resolve, reject ) => {

        // Then run the command and handle response
        const child = execFile(path.join(home, "/tools/arduino-cli"), commands, { cwd: process.cwd() }, (err, stdout, stderr) => {
            // Reject if error
            if (err) reject(err);

            // Otherwise resolve with response
            resolve(stdout);
        })

        // Stdout logs if debug
        if (debug) {
        
            child.stdout.pipe(process.stdout)
            child.stderr.pipe(process.stderr)

        }

    });

}