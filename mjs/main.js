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

ipcMain.on('request-update-search-enabled', (event, searchEnabled) => {
    menu.items[1].submenu.items[0].enabled = searchEnabled;
    event.returnValue = 0;
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
