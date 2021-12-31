// Upload command will compile the code
// and upload it to board

// Import libraries
// To build prompt
const inquirer = require('inquirer');

// Attach search list to inquirer
inquirer.registerPrompt("search", require("inquirer-search-list"));

// Library for logging
const log = require("./log");

// To handle directory
const fs = require("fs").promises;

// For home dir
const os = require("os");

// To handle path
const path = require("path");

// Import exec to run arduino commands
const arduino = require("./exec");

// Function to read suggestions
async function suggestions(uid, board) {
    // Grandeur directory
    const home = path.join(os.homedir(), ".grandeur");

    // In a try catch
    try {
        // Open the suggestion file
        var data = await fs.readFile(path.join(home, "/suggestions.json"));

        // Convert to json
        data = JSON.parse(data.toString());

        // If a uid is provided then also append the data
        if (uid) {
            // Append data
            data[uid] = board;

            // And update suggestions file
            await fs.writeFile(path.join(home, "/suggestions.json"), JSON.stringify(data));
        }

        // Return data
        return data;
    } 
    catch (error) {
        // Create empty object
        var data = {};

        // If a uid is provided then also create the file
        if (uid) {
            // Appen to data
            data[uid] = board;

            // And update suggestions file
            await fs.writeFile(path.join(home, "/suggestions.json"), JSON.stringify(data));
        }

        // File not found error
        return data;
    }
}

// Export a function, which will be passed to commander
module.exports = async function() {
    // In a try catch
    try {
        // List all connected boards
        var boards = await arduino(["board", "list"]);

        // Convert to json
        boards = JSON.parse(boards);

        // Get suggestions
        const keywords = await suggestions();

        // Formulate arrays for ports and board names
        var addresses = [];
        var ports = [];

        // To store filtered suggestions
        var filtered = [];
        var suggested = [];

        // Filter ports and remove non usb serial ports
        for (var board of boards) {
            // Continue if it is not a valid port
            if (board.port.protocol_label !== "Serial Port (USB)") continue;

            // Push port and label to respective array
            ports.push(board.port);
            addresses.push(board.port.address);

            // Get board unique id
            var uid = board.port.properties.pid + board.port.properties.vid;

            // Now match board vid and pid to suggestions
            if (keywords[uid]) {
                // If the connected port was used before
                // And insert the target label to keywords
                filtered.push(`${keywords[uid].name} (${board.port.address})`);

                // And push the address of the port and fqbn to suggested list
                suggested.push({

                    fqbn: keywords[uid].fqbn,
                    address: board.port.address

                });
            }
        }

        // If a board is not connected than throw an error
        if (ports.length === 0) {

            // Display message
            log.info("Connect a board to continue");

            // And exit
            throw {};
        }

        // Append the suggestions to addresses list with separator
        if (filtered.length !== 0) {
            // Concat addresses and ports
            addresses = filtered.concat(new inquirer.Separator(), addresses);
            ports = suggested.concat(new inquirer.Separator(), ports);
        }

        // Resolve promise and return address and ports
        return { addresses, ports, keywords: filtered, suggestions };
    } 
    catch (error) {
        // Pass error
        throw error;
    }
}