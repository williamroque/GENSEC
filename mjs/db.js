const { 
    app,
    dialog,
    ipcMain
} = require('electron');

ipcMain.on('request-data', getData);

const net = require('net');

const ip = '192.168.25.15';
const port = 5000;

function getData(event, path) {
    const client = net.createConnection({ port: 5000, host: 'localhost' }, () => {
        console.log('Initialized socket.');
        client.write('request_data\n' + path);
    });

    client.on('error', () => {
        console.log('Unable to connect.');

        dialog.showMessageBox({
            message: 'Unable to connect to the server.'
        }, () => app.quit());

        client.end();
    });

    client.setTimeout(20000);
    client.on('timeout', () => {
        console.log('Connection timed out.');
        app.quit();
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
