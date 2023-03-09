/** import */
const https = require('https');
const fs = require('fs');
// npm
const core = require('@actions/core');
const exec = require('@actions/exec');
/**  */

/** let */
let directoryInput;
let outputType
let scanOption;

/** const */
const DIRECTORY = 'directory';


async function run() {
    try {
        // Download the script using https
        const options = {
            hostname: 'raw.githubusercontent.com',
            path: '/carbonetes/diggity/main/install.sh',
            method: 'GET'
        };
        const request = https.request(options, response => {
            let script = '';
            response.on('data', chunk => {
                script += chunk;
            });
            response.on('end', async () => {
                // Save the script to a file
                await fs.promises.writeFile('./install.sh', script);

                // Make the script executable
                await exec.exec('chmod', ['+x', './install.sh']);

                // Run the script with the -d option to specify the installation directory
                await exec.exec('./install.sh');

                // Installation successful
                core.info('Diggity has been installed');


                // Check scan option based on user's input
                scanOption = checkScanOption();

                // Call the diggity binary
                await constructCommandExec(scanOption)
            });
        });
        request.on('error', error => {
            core.setFailed(error.message);
        });
        request.end();

    } catch (error) {
        core.setFailed(error.message);
    }
}

// Check user's input and set scan option
function checkScanOption() {
    directoryInput = core.getInput('directory', { required: true })
    if (directoryInput !== null || directoryInput !== '') {
        return DIRECTORY;
    }
}

async function constructCommandExec(scanOption) {
    let args = []
    
    // Check scan option
    switch (scanOption) {
        case DIRECTORY:
            args = [...args, '-d', string(directoryInput)]
            break;

        default:
            core.setFailed('Scan Option not found')
            break;
    }

    core.info("ARGS: ", args)
    exec.exec('./bin/diggity', ...args);
}

// Start diggity-Action
run();