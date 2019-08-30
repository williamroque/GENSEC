const ISDEVDIST = true;

const {
    app,
    dialog,
    BrowserWindow,
    Menu,
    MenuItem,
    ipcMain
} = require('electron');

const windowStateKeeper = require('electron-window-state');

const path = require('path');
const url = require('url');

const fs = require('fs');

const Connection = require('./connection');
const appdata = require('./appdata');

const { appdataPath } = appdata;
const appdataResources = require('./appdata-resources');

appdataResources.forEach(p => {
    const [ fileName, fileContent ] = p;
    const filePath = `${appdataPath}/${fileName}`;

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, fileContent);
    }
});

let settings;

const username = 'jetblack';
const password = 'viennablues';

let client;

dialog.showErrorBox = (title, content) => {
    console.log(`${title}\n${content}`);
};

function readSettings(event) {
    event.returnValue = settings;
}

function writeSettings(event, newSettings) {
    Object.keys(newSettings).forEach(setting => {
        settings[setting] = newSettings[setting];
    });

    event.returnValue = appdata.writeConfig(settings);
}

function getData(event, path) {
    if (client) {
        client.makeRequest('request_data\n' + path, ()=>{}).then(data => {
            event.returnValue = data;
        }).catch(console.log);
    }
}

function addRow(event, rowData, fileID) {
    if (client) {
        client.makeRequest('add\n' + rowData + '|' + fileID).then(data => {
            event.returnValue = data;
        }).catch(console.log);
    }
}

function deleteRow(event, rowIndex, fileID) {
    if (client) {
        client.makeRequest('delete\n' + rowIndex + '|' + fileID).then(data => {
            event.returnValue = data;
        }).catch(console.log);
    }
}

function updateRow(event, rowIndex, rowData, fileID) {
    if (client) {
        client.makeRequest('update\n' + rowIndex + '%' + rowData + '|' + fileID).then(data => {
            event.returnValue = data;
        }).catch(console.log);
    }
}

ipcMain.on('request-data', getData);
ipcMain.on('request-add-row', addRow);
ipcMain.on('request-delete-row', deleteRow);
ipcMain.on('request-update-row', updateRow);
ipcMain.on('request-read-settings', readSettings);
ipcMain.on('request-write-settings', writeSettings);

ipcMain.on('request-establish-connection', event => {
    settings = appdata.readConfig()

    if (client) {
        client.close();
        client = null;
    }

    client = new Connection(
        settings.host,
        settings.port,
        username,
        password,
        event,
        appdataPath
    );

    client.init.then()
        .then(() => {
            event.returnValue = 'connection_established';
        }).catch(err => {
            event.returnValue = err;
        });
});

let mainWin;

const menuTemplate = [
    ...(process.platform === 'darwin' ? [{role: 'appMenu'}] : []),
    {
        label: 'Text',
        submenu: [
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                click: () => mainWin.webContents.send('copy'),
                enabled: false
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                click: () => mainWin.webContents.send('paste'),
                enabled: false
            },
            { type: 'separator' },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                click: () => mainWin.webContents.send('select-all'),
                enabled: false
            },
        ]
    },
    {
        label: 'Form',
        submenu: [
            {
                label: 'Search',
                accelerator: 'CmdOrCtrl+F',
                click: () => mainWin.webContents.send('search-triggered'),
                enabled: false
            }
        ]
    },
    {
        label: 'Window',
        submenu: [
            { role: 'quit' },
            { type: 'separator' },
            { role: 'minimize' },
            { role: 'close' }
        ]
    },
    ...(ISDEVDIST ? [{
            label: 'Developer',
            submenu: [
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'CmdOrCtrl+Shift+I',
                    click: () => mainWin.webContents.toggleDevTools()
                }
            ]
    }] : [])
];

const menu = Menu.buildFromTemplate(menuTemplate);

ipcMain.on('request-update-search-enabled', (_, searchEnabled) => {
    menu.items[2].submenu.items[0].enabled = searchEnabled;
});

ipcMain.on('request-update-edit-enabled', (_, editEnabled) => {
    menu.items[1].submenu.items.forEach(elem => {
        if (elem.type !== 'separator') {
            elem.enabled = editEnabled;
        }
    });
});

const createWindow = () => {
    let mainWindowState = windowStateKeeper({
        defaultWidth: 1150,
        defaultHeight: 750
    });

    mainWin = new BrowserWindow({
        width: mainWindowState.width,
        height: mainWindowState.height,
        center: true,
        frame: false,
        minWidth: 890,
        minHeight: 610,
        maxWidth: 1150,
        maxHeight: 770,
        fullscreen: false,
        backgroundColor: '#0A0A0A',
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindowState.manage(mainWin);

    mainWin.loadURL(url.format({
        pathname: path.join(__dirname, '../html/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWin.on('closed', e => mainWin = null);

    Menu.setApplicationMenu(menu);
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWin.window === null) {
        mainWin = createWindow();
    }
});
