// Helper class to log messages to terminal

// Import modules
const chalk = require("chalk");

// Export the object
module.exports = {
    // Error
    error: (message, newline) => {
        // Setup newline context
        const start = newline === "start" || newline === "both" ? "\n" : "";
        const end = newline === "end" || newline === "both" ? "\n" : "";

        // Log the message
        console.log(`${start}grandeur ${chalk.bgRed("ERR")} ${message}${end}`)
    },
    
    // Info
    info: (message, newline) => {
        // Setup newline context
        const start = newline === "start" || newline === "both" ? "\n" : "";
        const end = newline === "end" || newline === "both" ? "\n" : "";

        // Log the message
        console.log(`${start}grandeur ${chalk.bgBlue("INFO")} ${message}${end}`)
    },

    // Success
    success: (message, newline) => {
        // Setup newline context
        const start = newline === "start" || newline === "both" ? "\n" : "";
        const end = newline === "end" || newline === "both" ? "\n" : "";

        // Log the message
        console.log(`${start}grandeur ${chalk.bgGreen("SUCCESS")} ${message}${end}`)
    },

    // Raw
    raw: (message) => console.log(message)
}