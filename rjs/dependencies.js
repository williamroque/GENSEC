const fs = require('fs');

// Starting point for JSON data
const index = 'forms/filesystem.json';
// Parsed data starting point
const indexData = JSON.parse(fs.readFileSync(index)).filesystem;

const navigationBar = document.querySelector('#navigate');
const contentWrapper = document.querySelector('#main-content');

let virtualPath = [];

let dataBody;

// Whether the currently selected option is to filter, add/edit, or build
const filterOption = document.querySelector('#filter');
const optionSelector = document.querySelector('#option-selector');

let currentAction;
let currentActionElement = filterOption;

let Actions = {
    FILTER: 0,
    MUTATE: 1,
    CREATE: 2
};

currentAction = Actions.FILTER;

const buttonMargin = 60;

let optionPosition;
window.requestAnimationFrame(() => {
    optionPosition = filterOption.getBoundingClientRect().top;
    optionSelector.style.top = optionPosition + 'px';
});

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

