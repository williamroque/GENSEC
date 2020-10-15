"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class Communication {
    static requestFilesystem(path, expectedEntry) {
        return new Promise(resolve => {
            electron_1.ipcRenderer.once('send-filesystem', (_, system) => resolve(system));
            electron_1.ipcRenderer.send('request-filesystem', path, expectedEntry);
        });
    }
    static requestExecutePackage(programName, packageName, input) {
        electron_1.ipcRenderer.send('request-execute-package', programName, packageName, input);
    }
    static requestSaveDialog(extensions) {
        return electron_1.ipcRenderer.sendSync('request-save-dialog', extensions);
    }
    static requestOpenDialog(extensions) {
        return electron_1.ipcRenderer.sendSync('request-open-dialog', extensions);
    }
    static requestUpdateSearchEnabled(searchEnabled) {
        electron_1.ipcRenderer.send('request-update-search-enabled', searchEnabled);
    }
    static requestUpdateEditEnabled(editEnabled) {
        electron_1.ipcRenderer.send('request-update-edit-enabled', editEnabled);
    }
    static requestDisplayErrorWindow(err) {
        electron_1.ipcRenderer.send('display-error-window', err);
    }
    static addListener(event, callback) {
        electron_1.ipcRenderer.on(event, callback);
    }
}
exports.default = Communication;
