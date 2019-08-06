const fs = require('fs');
const path = require('path');
const app = require('electron').app;

const configPath = app.getPath('userData') + path.normalize('/config.json');

let data = {
    ip: '0.0.0.0',
    port: 5000
};

function writeConfig(configData) {
    let returnValue = 0;
    fs.writeFile(configPath, JSON.stringify(configData), err => {
        if (err) returnValue = 1;
    });
    return returnValue;
}

function readConfig() {
    try {
        return JSON.parse(fs.readFileSync(configPath));
    } catch (err) {
        console.log(err);
    }
    return {};
}

if (!fs.existsSync(configPath)) {
    writeConfig(data);
}

module.exports = {
    writeConfig: writeConfig,
    readConfig: readConfig
};
