const { app, ipcMain } = require('electron');

ipcMain.on('request-data', getData);
ipcMain.on('request-add-row', addRow);
ipcMain.on('request-delete-row', deleteRow);
ipcMain.on('request-update-row', updateRow);
ipcMain.on('request-read-settings', readSettings);
ipcMain.on('request-write-settings', writeSettings);

const net = require('net');

const appdata = require('./appdata');

let settings = appdata.readConfig();

function createServer(request, event) {
    const client = net.createConnection({
        port: settings.port,
        host: settings.ip
    }, () => {
        console.log('Initialized socket.');
        client.write(request);
    });

    client.on('error', err => {
        event.returnValue = 'network_error';

        client.end();
    });

    client.setTimeout(5000);
    client.on('timeout', () => {
        event.returnValue = 'network_timeout';
        client.end();
    });

    let data = '';
    client.on('data', rawData => {
        rawData = rawData.toString();

        if (rawData.slice(rawData.length - 4, rawData.length) === 'exit') {
            data += rawData.slice(0, rawData.length - 4);

            event.returnValue = data;

            client.write('exit', 'utf8', () => {
                client.end();
            });
        } else {
            data += rawData;
        }
    });

    client.on('end', () => {
        console.log('Disconnected from server.');
    });
}

function getData(event, path) {
    createServer('request_data\n' + path, event);
}

function addRow(event, rowData, fileID) {
    createServer('add\n' + rowData + '|' + fileID, event);
}

function deleteRow(event, rowIndex, fileID) {
    createServer('delete\n' + rowIndex + '|' + fileID, event);
}

function updateRow(event, rowIndex, rowData, fileID) {
    createServer('update\n' + rowIndex + '%' + rowData + '|' + fileID, event);
}

function readSettings(event) {
    event.returnValue = settings;
}

function writeSettings(event, newSettings) {
    Object.keys(newSettings).forEach(setting => {
        settings[setting] = newSettings[setting];
    });

    event.returnValue = appdata.writeConfig(settings);
}
