const { ipcRenderer } = require('electron');

const { handleReturnCode } = require('./dependencies.js');

const fs = require('fs');

const index = 'forms/filesystem.json';
const indexData = JSON.parse(fs.readFileSync(index)).filesystem;

const overlayElem = document.querySelector('#overlay');

window.state = {
    isConnected: false,
    isForm: false,
    currentForm: null,
    dataBody: null,
    dataFull: null,
    currentAction: null,
    optionPosition: null,
    formIndex: null,
    virtualPath: [],
    indexShifts: new Set(),
    pathData: indexData
};

setTimeout(() => {
    overlayElem.classList.add('overlay-hidden');
}, 1400);

const returnCode = ipcRenderer.sendSync('request-establish-connection');
handleReturnCode(returnCode);
