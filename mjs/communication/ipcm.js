const {
    ipcMain,
    app
} = require('electron');
const path = require('path');

const settings = require('electron-settings');

const Filesystem = require('../filesystem/filesystem');
const Python = require('../python');
const Dialog = require('../dialog/dialog');

class Communication {
    static setDefaults() {
        ipcMain.on('request-filesystem', (event, path) => {
            event.reply('send-filesystem', (new Filesystem(path)).system);
        });

        ipcMain.on('request-execute-package', (_, programName, packageName, input) => {
            Python.run(
                [path.join(app.getPath('userData'), 'system', programName, packageName, 'main.py')],
                input,
                settings.getSync([programName, packageName, 'janela', 'entries', 'dataWindowClosesOnFinish', 'setting'])
            );
        });

        ipcMain.on('request-save-dialog', (event, extensions) => {
            event.returnValue = Dialog.createSaveDialog(extensions);
        });

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
    }
}

module.exports = Communication;
