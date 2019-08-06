const fs = require('fs');

// Starting point for JSON data
const index = 'forms/filesystem.json';
// Parsed data starting point
const indexData = JSON.parse(fs.readFileSync(index)).filesystem;

const navigationBar = document.querySelector('#navigate');
const contentWrapper = document.querySelector('#main-content');

const messagePrompt = document.querySelector('#message-prompt');
const mutatePrompt = document.querySelector('#mutate-prompt');

const editButton = document.querySelector('#edit-button');
const deleteButton = document.querySelector('#delete-button');

const searchButton = document.querySelector('#search-button');

let isUpdate = false;

let virtualPath = [];
let currentForm;

let dataBody;

let dataFull = null;

let isForm = false;

// Whether the currently selected option is to filter, add/edit, or build
const optionSelector = document.querySelector('#option-selector');

let currentAction;
let currentActionElement;

let Actions = {
    FILTER: 0,
    MUTATE: 1,
    CREATE: 2
};

const buttonMargin = 60;

let optionPosition;

// To apply shift when deletes occur
let indexShifts = new Set();

let formIndex;

let directoryList = document.createElement('UL');
directoryList.setAttribute('id', 'directory-list');

// Default data for home path
let pathData = indexData;

// "DOM"; elements accessible by forms
let dom = {};

// Relieve parent node of now redundant children
function clearNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function render(content, wrapper) {
    clearNode(wrapper);
    wrapper.appendChild(content);
}

function parseData(data) {
    let rows = data.split('\n');
    return rows.map(row => row.split(';'));
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

function handleWriteCode(code) {
    switch (code) {
        case 'write_failed':
            showMessagePrompt('Failed to write data.', 2500);
            break;
        case 'write_successful':
            showMessagePrompt('Successfully wrote data.', 1600);
            break;
        case 'network_error':
            showMessagePrompt('Unable to connect to server.', 2500);
            break;
        case 'network_timeout':
            showMessagePrompt('Connection timed out.', 2500);
            break;
        default:
            console.log('Invalid submit return code.');
            return false;
    }
    return true;
}

const getRelativeIndex = i => [...indexShifts].reduce((a, b) => i > b ? a - 1 : a, i);
