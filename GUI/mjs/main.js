const ISDEVDIST = true;

const path = require('path');
const {
    app,
    Menu,
    shell
} = require('electron');

const Window = require('./browser/window');
const Dialog = require('./dialog/dialog');
const Filesystem = require('./filesystem/filesystem');
const Communication = require('./communication/ipcm');
Communication.setDefaults();

const systemPath = path.join(app.getPath('userData'), 'system');

let mainWindow;
app.on('ready', () => {
    mainWindow = new Window({
        icon: '../assets/icon.png',
        frame: false,
        minWidth: 890,
        minHeight: 610,
        maxWidth: 1150,
        maxHeight: 770,
        fullscreen: false
    }, 'index.html', true);
    mainWindow.createWindow();
});

app.on('window-all-closed', () => {
    app.exit(0);
});

app.on('activate', () => {
    if (mainWindow.isNull()) {
        mainWindow.createWindow();
    }
});

const menuTemplate = [
    ...(process.platform === 'darwin' ? [{
        label: app.name,
        submenu: [{
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                label: 'Configurações',
                accelerator: 'CmdOrCtrl+,',
                click: () => {}
            },
            {
                type: 'separator'
            },
            {
                role: 'hide'
            },
            {
                role: 'hideothers'
            },
            {
                role: 'unhide'
            },
            {
                role: 'close'
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                accelerator: 'Cmd+Q',
                click: () => app.exit(0)
            }
        ]
    }] : []),
    {
        label: 'Text',
        submenu: [
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                click: () => mainWindow.dispatchWebEvent('copy'),
                enabled: false
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                click: () => mainWindow.dispatchWebEvent('paste'),
                enabled: false
            },
            { type: 'separator' },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                click: () => mainWindow.dispatchWebEvent('select-all'),
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
                click: () => mainWindow.dispatchWebEvent('search-triggered'),
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
    {
        label: 'Packages',
        submenu: [{
                label: 'Add Package',
                accelerator: 'CmdOrCtrl+Shift+P',
                click: () => {
                    const packagePath = Dialog.createOpenDialog([{ name: 'GENSEC Package', extensions: ['gpf'] }]);

                    if (packagePath) {
                        const filesystem = new Filesystem(systemPath);
                        filesystem.attemptInsertPackage(packagePath[0]).then(() => {
                            if (Dialog.ask('Reiniciar?')) {
                                app.relaunch();
                                app.exit();
                            }
                        }).catch(console.log);

                    }
                }
            }
        ]
    },
    ...(ISDEVDIST ? [{
            label: 'Developer',
            submenu: [
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'CmdOrCtrl+Alt+I',
                    click: () => mainWindow.toggleDevTools()
                }
            ]
    }] : []),
    {
        label: 'Help',
        role: 'help',
        submenu: [{
                type: 'separator'
            },
            {
                label: 'Relatar problema',
                click: () => shell.openExternal(
                    `mailto:william.roque@ethosgroup.com.br?subject=Arc@${app.getVersion()}%20Issue`
                )
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
