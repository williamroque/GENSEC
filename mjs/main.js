// Electron app import
const { app, dialog } = require('electron');

// Window class import
const Window = require('./window');

// Main window properties
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
};

// Main window
let mainWin;

// Create main window as Window object 
const createWindow = () => mainWin = new Window(mainWinObject);

// Create window when ready
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

