const { ipcRenderer } = require('electron');

class Communication {
    static requestFilesystem(path, callback) {
        ipcRenderer.once('send-filesystem', callback);
        ipcRenderer.send('request-filesystem', path);
    }

    static requestUpdateSearchEnabled(searchEnabled) {
        ipcRenderer.send('request-update-search-enabled', searchEnabled);
    }

    static requestUpdateEditEnabled(editEnabled) {
        ipcRenderer.send('request-update-edit-enabled', editEnabled);
    }

    static addListener(event, callback) {
        ipcRenderer.on(event, callback);
    }
}
module.exports = Communication;
