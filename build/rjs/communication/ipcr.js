"use strict";
const { ipcRenderer } = require('electron');
class Communication {
    static requestFilesystem(path, expectedEntry) {
        return new Promise(resolve => {
            ipcRenderer.once('send-filesystem', (_, system) => resolve(system));
            ipcRenderer.send('request-filesystem', path, expectedEntry);
        });
    }
    static requestExecutePackage(programName, packageName, input) {
        ipcRenderer.send('request-execute-package', programName, packageName, input);
    }
    static requestSaveDialog(extensions) {
        return ipcRenderer.sendSync('request-save-dialog', extensions);
    }
    static requestUpdateSearchEnabled(searchEnabled) {
        ipcRenderer.send('request-update-search-enabled', searchEnabled);
    }
    static requestUpdateEditEnabled(editEnabled) {
        ipcRenderer.send('request-update-edit-enabled', editEnabled);
    }
    static requestDisplayErrorWindow(err) {
        ipcRenderer.send('display-error-window', err);
    }
    static addListener(event, callback) {
        ipcRenderer.on(event, callback);
    }
}
module.exports = Communication;
