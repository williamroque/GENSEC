// To read JSON files
const fs = require('fs');

// Starting point for JSON data
const index = 'forms/filesystem.json';
// Parsed data starting point
const indexData = JSON.parse(fs.readFileSync(index)).filesystem;

// Wrapper for form and directory content
const contentWrapper = document.querySelector('#main-content');
// Wrapper for navigation bar content
const navigationBar = document.querySelector('#navigate');

// Virtual path for current directory in JSON-based filesystem
let virtualPath = [];

// "DOM"; elements accessible by forms
let dom = {};

// List of directories for user navigation
let directoryList = document.createElement('UL');
directoryList.setAttribute('id', 'directory-list');

// Default data for home path
let pathData = indexData;

// Create list of directories based on current directory of JSON filesystem
function createList() {
    // For each file in current directory, add to directory listing
    pathData.forEach(file => {
        // Get type of file (should be form or directory)
        const type = file.type;
        // Get name of file
        const name = file.name;
        // Get id of file (for database)
        const id = file.id;

        // Fail for files that are neither forms nor directories
        if (type !== 'form' && type !== 'directory') {
            console.log('Invalid JSON');
            process.exit();
        }

        // Create text element for name
        const nameText = document.createTextNode(name);

        // Create list element for directory
        dom[name] = document.createElement('LI');
        // Set directory class for directory list item
        dom[name].setAttribute('class', 'directory');
        // Set id of list item
        dom[name].setAttribute('id', id);
        // Add text to list item
        dom[name].appendChild(nameText);

        // Add list item to list of directories
        directoryList.appendChild(dom[name]);
    });

    // Add click event listener to each "DOM" element
    Object.keys(dom).forEach(key => {
        dom[key].addEventListener('click', e => {
            // Reset "DOM"
            dom = {};

            // Add file (directory/form) name to virtual path
            virtualPath.push(key);

            // Selected file
            const id = e.target.id;
            const fileObject = pathData.find(file => file.id === id);

            if (fileObject.type === 'directory') {
                pathData = fileObject.content;
            } else {
                let data = [];
                if (fileObject.location === 'remote') {
                    data = JSON.parse(fs.readFileSync('forms/' + fileObject.path));
                } else {
                    data = fileObject.form;
                }
                renderForm(data);
                return;
            }

            // Update display
            update();
        }, false);
    });
}

// Function for setting label or input class
function addInputClass(className, index, e) {
    e.target
        .parentNode
        .childNodes[index]
        .classList
        .add(className);
}

// Function for resetting label or input class
function removeInputClass(className, index, e) {
    e.target
        .parentNode
        .childNodes[index]
        .classList
        .remove(className);
}

// Render form data
function renderForm(data) {
    const formTable = document.createElement('DIV');
    formTable.setAttribute('class', 'form-table');

    data.form.forEach((row, i) => {
        const rowElement = document.createElement('DIV');
        rowElement.setAttribute('class', 'form-row');

        row.forEach((col, j) => {
            const colElement = document.createElement('DIV');
            colElement.setAttribute('class', 'form-col');

            const colId = 'col-' + i + j;

            let inputElement;

            if (col.type === 'textarea') {
                inputElement = document.createElement('TEXTAREA');

                inputElement.style.height = col.rows + 'em';
                inputElement.style.width = col.cols + 'em';
            } else {
                inputElement = document.createElement('INPUT');
                colElement.style.width = col.fill + '%';
                inputElement.setAttribute('type', col.type);
            }

            inputElement.setAttribute('class', 'form-input');
            inputElement.setAttribute('id', colId);

            if (col.label) {
                const labelElement = document.createElement('LABEL');
                labelElement.setAttribute('for', colId);

                if (col.type === 'text') {
                    labelElement.setAttribute('class', 'form-text-input-label');
                } else {
                    labelElement.setAttribute('class', 'form-textarea-label');
                }

                const labelText = document.createTextNode(col.label);
                labelElement.appendChild(labelText);
            
                colElement.appendChild(labelElement);
            }

            if (col.value) {
                inputElement.setAttribute('value', col.value);
            }

            let click = () => {};
            let change = () => {};
            let keydown = () => {};

            if (col.script) eval(col.script);

            inputElement.addEventListener('click', e => {
                click(dom, e);
            }, false);
            inputElement.addEventListener('change', e => {
                change(dom, e);

                console.log(e.target.tagName.toLowerCase(), e.target.type);

                if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'text') {
                    if (e.target.value !== '') {
                        addInputClass('form-text-input-label-active', 0, e);
                        addInputClass('form-text-input-active', 1, e);
                    } else {
                        removeInputClass('form-text-input-label-active', 0, e);
                        removeInputClass('form-text-input-active', 1, e);
                    }
                } else if (e.target.tagName.toLowerCase() === 'textarea') {
                    if (e.target.value !== '') {
                        addInputClass('form-textarea-label-active', 0, e);
                        addInputClass('form-textarea-active', 1, e);
                    } else {
                        removeInputClass('form-textarea-label-active', 0, e);
                        removeInputClass('form-textarea-active', 1, e);
                    }
                }
            }, false);
            inputElement.addEventListener('keydown', e => {
                keydown(dom, e);
            }, false);

            colElement.appendChild(inputElement);

            rowElement.appendChild(colElement);
        });

        formTable.appendChild(rowElement);
    });

    render(formTable, contentWrapper);
}

// Relieve parent node of now redundant children
function clearNode(node) {
    // While node has at least one child, remove first child
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

// Clear wrapper, then render content to it
function render(content, wrapper) {
    clearNode(wrapper);
    wrapper.appendChild(content);
}

// Update wrappers
function update() {
    // Clear directory list
    clearNode(directoryList);
    // Update directory list
    createList();
    // Render directory list
    render(directoryList, contentWrapper);

    // Clear navigation bar
    clearNode(navigationBar);

    // For each virtual path element (with home added at the beginning),
    // concatenate to navigation bar
    [''].concat(virtualPath).forEach(file => {
        // Create wrapper element
        const wrapperElem = document.createElement('SPAN');

        // Create directory element
        const directoryElem = document.createElement('SPAN');
        // Create text for directory element
        const directoryElemText = document.createTextNode(file);

        // Set class for element
        directoryElem.setAttribute('class', 'dir-label');

        // Change to span path on click
        wrapperElem.addEventListener('click', e => {
            // Get clicked element text
            let text = e.target.innerText;
            // Remove directory slash from end of text
            text = text.slice(0, text.length - 1 || 1);

            // Handle home directory
            if (text === '/') {
                virtualPath = [];
                update();
                return;
            }

            // Cut current path to clicked directory
            virtualPath = virtualPath.slice(0, virtualPath.indexOf(text));

            update();
        }, false);

        // Append text to directory element
        directoryElem.appendChild(directoryElemText);

        // Directory slash
        const slashElem = document.createElement('SPAN');
        // Slash class
        slashElem.setAttribute('class', 'dir-slash');
        // Slash text
        const slashText = document.createTextNode('/');
        // Append slash text to element
        slashElem.appendChild(slashText);
        
        // Append directory and slash elements to directory wrapper
        wrapperElem.appendChild(directoryElem);
        wrapperElem.appendChild(slashElem);

        // Render directory element to navigation bar
        navigationBar.appendChild(wrapperElem);

    // Remove home directory from virtual path
    });
}

// Start content display
update();
