const ISDEVDIST = false;

import path from 'path';
import { app, Menu, shell } from 'electron';
import fs from 'fs';

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

                if (typeof packagePath !== 'undefined') {
                    const filesystem = new Filesystem(systemPath);
                    filesystem.attemptInsertPackage(packagePath[0]).then(() => {
                        if (Dialog.ask('Reiniciar?')) {
                            app.relaunch();
                            app.exit();
                        }
                    }).catch(console.log);
                }
            }
        }]
    },
    {
        label: 'Network',
        submenu: [{
            label: 'Add Certificate',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: () => {
                const certificatePath = Dialog.createOpenDialog([{ name: 'Certificate', extensions: ['pem'] }]);
                const certificatesDirectory = path.join(app.getPath('userData'), 'cert');

                if (typeof certificatePath !== 'undefined') {
                    try {
                        if (!fs.existsSync(certificatesDirectory)) {
                            fs.mkdirSync(certificatesDirectory);
                        }

                        fs.copyFileSync(
                            certificatePath[0],
                            path.join(certificatesDirectory, path.basename(certificatePath[0]))
                        );
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }]
    },
    {
        label: 'Developer',
        submenu: [
            {
                label: 'Toggle Developer Tools',
                accelerator: 'CmdOrCtrl+Alt+I',
                click: async () => {
                    if (ISDEVDIST || await Dialog.passwordPrompt('3d88a235ac0f4065c043d705e74e3f0ff0393e76633dfe4c90fddd269dac3b5e')) {
                        mainWindow.toggleDevTools();
                    }
                }
            },
            {
                label: 'Open Application Support',
                accelerator: 'CmdOrCtrl+Shift+A',
                click: async () => {
                    if (ISDEVDIST || await Dialog.passwordPrompt('3d88a235ac0f4065c043d705e74e3f0ff0393e76633dfe4c90fddd269dac3b5e')) {
                        shell.openPath(app.getPath('userData'));
                    }
                }
            }
        ]
    },
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
