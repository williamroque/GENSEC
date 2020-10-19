"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ISDEVDIST = true;
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const window_1 = __importDefault(require("./browser/window"));
const dialog_1 = __importDefault(require("./dialog/dialog"));
const filesystem_1 = __importDefault(require("./filesystem/filesystem"));
const ipcm_1 = __importDefault(require("./communication/ipcm"));
const systemPath = path_1.default.join(electron_1.app.getPath('userData'), 'system');
let mainWindow;
electron_1.app.on('ready', () => {
    mainWindow = new window_1.default({
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
electron_1.app.on('window-all-closed', () => {
    electron_1.app.exit(0);
});
electron_1.app.on('activate', () => {
    if (mainWindow.isNull()) {
        mainWindow.createWindow();
    }
});
const menuTemplate = [
    ...(process.platform === 'darwin' ? [{
            label: electron_1.app.name,
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
                    click: () => electron_1.app.exit(0)
                }
            ]
        }] : []),
    { role: 'editMenu' },
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
                    const packagePath = dialog_1.default.createOpenDialog([{ name: 'GENSEC Package', extensions: ['gpf'] }]);
                    if (typeof packagePath !== 'undefined') {
                        const filesystem = new filesystem_1.default(systemPath);
                        filesystem.attemptInsertPackage(packagePath[0]).then(() => {
                            if (dialog_1.default.ask('Reiniciar?')) {
                                electron_1.app.relaunch();
                                electron_1.app.exit();
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
                    const certificatePath = dialog_1.default.createOpenDialog([{ name: 'Certificate', extensions: ['pem'] }]);
                    const certificatesDirectory = path_1.default.join(electron_1.app.getPath('userData'), 'cert');
                    if (typeof certificatePath !== 'undefined') {
                        try {
                            if (!fs_1.default.existsSync(certificatesDirectory)) {
                                fs_1.default.mkdirSync(certificatesDirectory);
                            }
                            fs_1.default.copyFileSync(certificatePath[0], path_1.default.join(certificatesDirectory, path_1.default.basename(certificatePath[0])));
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }
                }
            }]
    },
    ...(ISDEVDIST ? [{
            label: 'Developer',
            submenu: [
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'CmdOrCtrl+Alt+I',
                    click: () => mainWindow.toggleDevTools()
                },
                {
                    label: 'Open Application Support',
                    accelerator: 'CmdOrCtrl+Shift+A',
                    click: () => electron_1.shell.openPath(electron_1.app.getPath('userData'))
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
                click: () => electron_1.shell.openExternal(`mailto:william.roque@ethosgroup.com.br?subject=Arc@${electron_1.app.getVersion()}%20Issue`)
            }
        ]
    }
];
const menu = electron_1.Menu.buildFromTemplate(menuTemplate);
electron_1.Menu.setApplicationMenu(menu);
ipcm_1.default.setDefaults(menu);
