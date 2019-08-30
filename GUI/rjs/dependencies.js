const fs = require('fs');

const contentWrapper = document.querySelector('#main-content');

const messagePrompt = document.querySelector('#message-prompt');

const overlayElem = document.querySelector('#overlay');

const optionSelector = document.querySelector('#option-selector');

const Actions = {
    FILTER: 0,
    MUTATE: 1,
    CREATE: 2
};

// Relieve parent of obsolete children
function clearNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function render(content, wrapper) {
    clearNode(wrapper);
    wrapper.appendChild(content);
}

const getFileObject = id => pathData.find(file => file.id === id);

function toggleOpacity(increment, elem, callback, dt=7) {
    let opacity = Math.ceil(elem.style.opacity);

    let step = callback => {
        if (opacity > 1 || opacity < 0) {
            elem.style.opacity = Math.round(Math.abs(opacity));
            if (callback) {
                callback();
            }
        } else {
            opacity = parseFloat((((opacity * 10 | 0) + increment) / 10).toFixed(1));
            elem.style.opacity = opacity;
            setTimeout(step, dt, callback);
        }
    };

    step(callback);
}

function setToggleTimeout(t) {
    return setTimeout(() => {
        toggleOpacity(-1, messagePrompt);
        mPromptVisible = false;
    }, t);
}

let mPromptVisible = false;
let currentTimeout;
function showMessagePrompt(message, t=2000) {
    messagePrompt.innerHTML = message;

    if (!mPromptVisible) {
        mPromptVisible = true;
        toggleOpacity(1, messagePrompt);
    } else {
        clearTimeout(currentTimeout);
    }
    currentTimeout = setToggleTimeout(t);
}

function renderObject(id, fileObject, actionOverride) {
    let formData = {};

    if (fileObject.location === 'remote') {
        formData = JSON.parse(fs.readFileSync('forms/' + fileObject.path));
    } else {
        formData = fileObject.form;
    }

    currentForm = fileObject;

    isForm = true;

    update(false);

    let action = actionOverride ? actionOverride : currentAction;

    if (action === Actions.FILTER) {
        searchButton.classList.add('search-button-enabled');
        requestUpdateSearchEnabled(true);
        renderFilterTable(fileObject, formData);
    } else if (action === Actions.MUTATE) {
        renderForm(formData, fileObject.id);
    }

    dataBody = formData;
    return formData;
}

function reconnect() {
    const returnCode = ipcRenderer.sendSync('request-establish-connection');
    handleReturnCode(returnCode);
}

function handleReturnCode(code) {
    if (!overlayElem.classList.contains('overlay-hidden')) {
        setTimeout(() => handleReturnCode(code), 300);
        return;
    }
    switch (code) {
        case 'write_failed':
            showMessagePrompt('Failed to write data.', 2500);
            break;
        case 'write_successful':
            showMessagePrompt('Successfully wrote data.', 1600);
            break;
        case 'network_error':
            showMessagePrompt('Unable to connect to server.', 10000);
            isConnected = false;
            setTimeout(reconnect, 5000);
            break;
        case 'network_timeout':
            showMessagePrompt('Connection timed out.', 2500);
            isConnected = false;
            setTimeout(reconnect, 5000);
            break;
        case 'connection_established':
            showMessagePrompt('Connection established.', 1000);
            isConnected = true;
            break;
        default:
            console.log('Invalid submit return code.');
    }
}

const getRelativeIndex = i => [...indexShifts].reduce((a, b) => i > b ? a - 1 : a, i);

module.exports = {
    showMessagePrompt,
    getRelativeIndex,
    handleReturnCode,
    reconnect,
    clearNode,
    renderObject,
    render,
    Actions
};
