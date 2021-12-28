// Grandeur toolchain is designed to be 
// make it easier for developers to get started
// with IoT dev. It is lose coupling on Arduino
// This toolchain is to Arduino, just the way
// Keras is to Tensorflow

// This file will be primarily used to define
// and link all the sub commands

// Import libraries
const commander = require("commander");

// Include sub commands
const init = require("./commands/init");

// Create a new program
const program = new commander.Command();

// Add init command to the program
program
    .command("init")
    .description("create a new sketch")
    .action(init);

// Then run the handler
program.parse(process.argv);