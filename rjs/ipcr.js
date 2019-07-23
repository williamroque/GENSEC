const { ipcRenderer } = require('electron');

function requestData(form) {
    return ipcRenderer.sendSync('request-data', form);
}

function requestAddRow(rowData) {
    return ipcRenderer.sendSync('request-add-row', rowData);
}
