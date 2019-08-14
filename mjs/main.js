const ISDEVDIST = true;

const {
    app,
    dialog,
    BrowserWindow,
    Menu,
    MenuItem,
    ipcMain
} = require('electron');

const path = require('path');
const url = require('url');

const data = require('./db');

const mainWinObject = {
    width: 1150,
    height: 750,
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
};

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
    mainWin = new BrowserWindow(mainWinObject);

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
