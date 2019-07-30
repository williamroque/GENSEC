const {
    app,
    dialog,
    BrowserWindow
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

const createWindow = () => {
    mainWin = new BrowserWindow(mainWinObject);

    mainWin.loadURL(url.format({
        pathname: path.join(__dirname, '../html/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWin.on('closed', e => mainWin = null);
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
