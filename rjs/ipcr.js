const { ipcRenderer } = require('electron');

function requestData(form) {
    return ipcRenderer.sendSync('request-data', form);
}
