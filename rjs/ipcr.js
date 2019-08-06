const { ipcRenderer } = require('electron');

function requestData(form) {
    return ipcRenderer.sendSync('request-data', form);
}

function requestAddRow(rowData, formID) {
    return ipcRenderer.sendSync('request-add-row', rowData, formID);
}

function requestDeleteRow(rowIndex, formID) {
    return ipcRenderer.sendSync('request-delete-row', rowIndex, formID);
}

function requestUpdateRow(rowIndex, rowData, formID) {
    return ipcRenderer.sendSync('request-update-row', rowIndex, rowData, formID);
}

function requestWriteSettings(settings) {
    return ipcRenderer.sendSync('request-write-settings', settings);
}

function requestReadSettings() {
    return ipcRenderer.sendSync('request-read-settings');
}

function requestUpdateSearchEnabled(searchEnabled) {
    return ipcRenderer.sendSync('request-update-search-enabled', searchEnabled);
}
