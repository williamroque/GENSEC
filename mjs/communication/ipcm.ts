import { ipcMain, app, Menu } from 'electron';
import path from 'path';

import settings from 'electron-settings';

import Filesystem from '../filesystem/filesystem';
import Python from '../python';
import Dialog from '../dialog/dialog';
import Window from '../browser/window';

export default class Communication {
    static setDefaults(menu: Menu) {
        ipcMain.on('request-filesystem', (event, path, expectedEntry) => {
            event.reply('send-filesystem', (new Filesystem(path, expectedEntry)).system);
        });

        ipcMain.on('request-execute-package', (_, programName, packageName, input) => {
            Python.run(
                [path.join(app.getPath('userData'), 'system', programName, packageName, 'main.py')],
                input,
                settings.getSync([programName, packageName, 'janela', 'entries', 'dataWindowClosesOnFinish', 'setting']) === true
            );
        });

        ipcMain.on('request-save-dialog', (event, extensions) => {
            event.returnValue = Dialog.createSaveDialog(extensions);
        });

        ipcMain.on('request-open-dialog', (event, extensions) => {
            event.returnValue = Dialog.createOpenDialog(extensions);
        });

        ipcMain.on('request-update-search-enabled', (_, searchEnabled) => {
            if (typeof menu?.items[2]?.submenu?.items[0] !== 'undefined') {
                menu.items[2].submenu.items[0].enabled = searchEnabled;
            }
        });

        ipcMain.on('request-update-edit-enabled', (_, editEnabled) => {
            if (typeof menu?.items[1]?.submenu?.items !== 'undefined') {
                menu.items[1].submenu.items.forEach(elem => {
                    if (elem.type !== 'separator') {
                        elem.enabled = editEnabled;
                    }
                });
            }
        });

        ipcMain.on('display-error-window', (_, err) => {
            const errorWindow = new Window({
                width: 820,
                height: 700,
                minWidth: 400,
                minHeight: 600
            }, '../html/error.html', false);
            errorWindow.createWindow();
            errorWindow.dispatchWebEvent('error', err);
        });
    }
}
