// Meant to handle arduino installation

// Import libraries
// For path
const path = require("path");

// For file system handling
const fs = require("fs").promises;

// Use os to get home dir
const os = require("os");

// To make web request
const axios = require('axios')  

// Progress bar
const progress = require('progress')

// To create streamable buffer
const streamBuffers = require("stream-buffers");

// To decompress
const decompress = require("decompress");

// Library for logging
const log = require("./log");

// Export a function
module.exports = function() {
    // Return a new promise
    return new Promise( async (resolve, reject) => {
        // Use try catch to handle errors
        try {
            // Validate that the arduino is installed
            await fs.access(path.join(os.homedir(), "./.grandeur/tools/arduino-cli"));

            // Then resolve the promise
            resolve();
        } 
        catch (error) {
            // It is a different error
            if (error.code !== "ENOENT") return reject(error);

            // Use another try catch to handle errors
            try {
                // Log message
                log.info("Compiler dependency not found!", "both");

                // Arduino not found
                // Create grandeur and tools folder
                await fs.mkdir(path.join(os.homedir(), "./.grandeur/tools"), { recursive: true });

                // Formualate url
                const url = "https://github.com/arduino/arduino-cli/releases/download/0.20.2/arduino-cli_0.20.2_macOS_64bit.tar.gz";

                // Create download stream
                const download = new streamBuffers.WritableStreamBuffer({
                    initialSize: (1000 * 1024),   
                    incrementAmount: (1000 * 1024) 
                });

                // Make web request
                const { data, headers } = await axios({
                    url,
                    method: 'GET',
                    responseType: 'stream'
                })

                // Get total length in mb
                const totalLength = headers['content-length'];

                // Display progress bar
                const bar = new progress('-> downloading [:bar] :percent :etas', {
                    width: 40,
                    complete: '=',
                    incomplete: ' ',
                    renderThrottle: 1,
                    total: parseInt(totalLength)
                });
                
                // Update progress bar with every chunk
                data.on('data', (chunk) => bar.tick(chunk.length));

                // And pipe data to buffer
                data.pipe(download);

                // Attach handler on stream finish
                data.on("end", async () => {
                    // Download completed
                    // Publish log
                    log.success("Download completed.", "both");

                    // Then decompress downloaded content into dist directory
                    await decompress(download.getContents(), path.join(os.homedir(), "./.grandeur/tools/"));

                    // Then resolve the promise
                    resolve();
                });
            } 
            catch (err) {
                // If it is an axios error
                // Then display download failed message
                if (err.isAxiosError) log.error("Downlaod failed!");

                // and reject anyway
                reject(err);
            }
        }
    });
}
