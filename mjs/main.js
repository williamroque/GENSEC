const { app, dialog } = require('electron');

const Window = require('./window');

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
    webPreferences: {
        nodeIntegration: true
    }
};

let mainWin;

const createWindow = () => mainWin = new Window(mainWinObject);

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
