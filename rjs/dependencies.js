const fs = require('fs');

// Starting point for JSON data
const index = 'forms/filesystem.json';
// Parsed data starting point
const indexData = JSON.parse(fs.readFileSync(index)).filesystem;

const navigationBar = document.querySelector('#navigate');
const contentWrapper = document.querySelector('#main-content');

const messagePrompt = document.querySelector('#message-prompt');

let virtualPath = [];

let dataBody;

let isFirst = true;

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

function toggleOpacity(elem, callback, dt=7) {
    let opacity = Math.ceil(elem.style.opacity);
    const increment = 1 - opacity * 2;

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

function showMessagePrompt(message, t=2000) {
    messagePrompt.innerHTML = message;
    toggleOpacity(messagePrompt);

    setTimeout(() => {
        toggleOpacity(messagePrompt, () => {
            clearNode(messagePrompt);
        });
    }, t);
}
