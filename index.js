#!/usr/bin/env node
'use strict';
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
const upload = require("./commands/upload");
const monitor = require("./commands/monitor");
const install = require("./commands/install");

// Create a new program
const program = new commander.Command();

// Add init command to the program
program
    .command("init")
    .description("create a new sketch")
    .action(init);

// Add upload command to the program
program
    .command("upload")
    .description("compile and upload sketch")
    .action(upload);

// Add monitor command to the program
program
    .command("monitor")
    .description("attach to serial of a board")
    .action(monitor);

// Add monitor command to the program
program
    .command("install [module]")
    .description("install dependencies or module")
    .action(install);

// Then run the handler
program.parse(process.argv);