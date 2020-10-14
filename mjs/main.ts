const ISDEVDIST = true;

import path from 'path';
import { app, Menu, shell } from 'electron';

import Window from './browser/window';
import Dialog from './dialog/dialog';
import Filesystem from './filesystem/filesystem';
import Communication from './communication/ipcm';

const systemPath = path.join(app.getPath('userData'), 'system');

let mainWindow: Window;
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
                role: 'hideOthers'
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
    {role: 'editMenu'},
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

Communication.setDefaults(menu);