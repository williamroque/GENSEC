const {
    clearNode,
    Actions
} = require('./dependencies');

const searchPrompt = document.querySelector('#search-prompt');

const searchInput = document.querySelector('#search-input');
const searchLabel = document.querySelector('#search-label');

const currentSearchByButton = document.querySelector('#current-search-by');
const searchByOptions = document.querySelectorAll('.search-by-option');
const searchByOptionsWrapper = document.querySelector('#search-by-options-wrapper');

const searchButton = document.querySelector('#search-button');

let currentSearchBy;

let headerMap = {};

let searchPromptVisible = false;

function searchFor(term, by) {
    term = term.toLowerCase();
    if (term) {
        renderFilterTable(null, dataBody, row =>
            row[by].toLowerCase().indexOf(term) !== -1
        );
    } else {
        renderFilterTable(currentForm, dataBody);
    }
}

function showSearchPrompt() {
    hideMutatePrompt();
    if (currentAction === Actions.FILTER && isForm && !searchPromptVisible) {
        searchPrompt.classList.add('search-prompt-active');

        let headers = dataBody.form.flat().map(obj => obj.label).filter(h => h);

        let currentHeader = headers.shift();

        currentSearchBy = currentHeader;
        currentSearchByButton.textContent = currentHeader;

        headerMap[currentHeader] = 0;

        headers.forEach((h, i) => {
            headerMap[h] = i + 1;

            const searchOptionElem = document.createElement('DIV');
            searchOptionElem.classList.add('search-by-option');

            const optionText = document.createTextNode(h);
            searchOptionElem.appendChild(optionText);

            searchOptionElem.addEventListener('click', updateCurrentSearchBy, false);

            searchByOptionsWrapper.appendChild(searchOptionElem);
        });

        searchPromptVisible = true;
    }
}

function hideSearchPrompt() {
    if (searchPromptVisible) {
        searchPrompt.classList.remove('search-prompt-active');

        searchByOptionsWrapper.classList.remove('search-by-options-visible');
        currentSearchByButton.classList.remove('current-search-by-active');

        currentSearchByButton.textContent = '';
        clearNode(searchByOptionsWrapper);

        searchInput.value = '';

        searchPromptVisible = false;
    }
}

ipcRenderer.on('search-triggered', showSearchPrompt);

searchPrompt.addEventListener('click', e => {
    e.stopPropagation()

    searchByOptionsWrapper.classList.remove('search-by-options-visible');
    currentSearchByButton.classList.remove('current-search-by-active');
}, false);

function updateCurrentSearchBy(e) {
    let temp = currentSearchBy;

    currentSearchBy = e.currentTarget.textContent;
    currentSearchByButton.textContent = currentSearchBy;

    e.currentTarget.textContent = temp;
}

searchButton.addEventListener('click', e => {
    e.stopPropagation();
    showSearchPrompt();
}, false);

searchInput.addEventListener('change', () => {
    if (searchInput.value !== '') {
        searchInput.classList.add('search-input-active');
        searchLabel.classList.add('search-label-active');
    } else {
        searchInput.classList.remove('search-input-active');
        searchLabel.classList.remove('search-label-active');
    }
}, false);

searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        if (dataFull) {
            searchFor(searchInput.value, headerMap[currentSearchBy]);
            hideSearchPrompt();
        }
    }
}, false);

currentSearchByButton.addEventListener('click', e => {
    e.stopPropagation();
    searchByOptionsWrapper.classList.add('search-by-options-visible');
    currentSearchByButton.classList.add('current-search-by-active');
}, false);

document.addEventListener('click', hideSearchPrompt, false);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        hideSearchPrompt();
    } else if (e.key === 'Enter' && searchPromptVisible) {
        searchInput.focus();
    }
});
