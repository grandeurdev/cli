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
        // Grandeur directory
        const home = path.join(os.homedir(), ".grandeur");

        // Get platform name
        const platform = os.platform();

        // Validate platform name
        if (!["darwin", "win32"].includes(platform)) {
            // Throw invalid platform error
            log.error("Invalid platform!", "both");

            // and throw
            return reject({ code: "INVALID-PLATFORM" }); 
        }

        // Use try catch to handle errors
        try {
            // Validate that the arduino is installed
            await fs.access(path.join(home, `/tools/arduino-cli${platform === "win32" ? ".exe" : ""}`));

            // Then resolve the promise
            resolve();
        } 
        catch (error) {
            // It is a different error
            if (error.code !== "ENOENT") return reject(error);

            // Use another try catch to handle errors
            try {
                // Log message
                log.info("Downloading Arduino", "both");

                // Arduino not found
                // Create grandeur and tools folder
                await fs.mkdir(path.join(home, "/tools"), { recursive: true });

                // Formualate url
                const url = `https://github.com/arduino/arduino-cli/releases/download/0.26.0/arduino-cli_0.26.0_${ platform === "win32" ? "Windows_64bit.zip" : "macOS_64bit.tar.gz"}`;

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
                    await decompress(download.getContents(), path.join(home, "/tools/"));

                    // Finally write the config file
                    await fs.writeFile(path.join(home, "/tools/arduino-cli.json"), JSON.stringify({

                        // Add additional board url
                        board_manager: {
                            additional_urls: ["https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json", "https://arduino.esp8266.com/stable/package_esp8266com_index.json"]
                        },

                        // To run the arduino into daemon mode
                        daemon: {
                            port: "50051"
                        },

                        // Directories to save arduino data
                        directories: {
                            data: home + "/data",
                            downloads: home + "/staging",
                            user: home + "/user",
                        },

                        // Settings related to library
                        library: {
                            enable_unsafe_install: false
                        },

                        // Logging settings
                        logging: {
                            file: "",
                            format: "text",
                            level: "info"
                        },

                        // Metrics config
                        metrics: {
                            addr: ":9090",
                            enabled: true
                        },

                        // Output config
                        output: {
                            no_color: false
                        },

                        // Config for sketch
                        sketch: {
                            always_export_binaries: false
                        },

                        // Enable update notifications
                        updater: {
                            enable_notification: true
                        }
                    }, null, 4));

                    // Then resolve the promise
                    resolve();
                });
            } 
            catch (err) {
                // If it is an axios error
                // Then display download failed message
                if (err.isAxiosError) log.error("Download failed!");

                // and reject anyway
                reject(err);
            }
        }
    });
}
