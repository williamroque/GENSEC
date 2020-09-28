const { ipcMain } = require('electron');
const Filesystem = require('../filesystem/filesystem');

class Communication {
    static setDefaults() {
        ipcMain.on('request-filesystem', (event, path) => {
            event.reply('send-filesystem', (new Filesystem(path)).system);
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
