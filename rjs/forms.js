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

// Render form data
function renderForm(data) {
    const formTable = document.createElement('TABLE');
    formTable.setAttribute('class', 'form-table');

    data.form.forEach((row, i) => {
        const rowElement = document.createElement('TR');
        rowElement.setAttribute('class', 'form-row');

        row.forEach((col, j) => {
            const colElement = document.createElement('TD');
            colElement.setAttribute('class', 'form-col');

            const colId = 'col-' + i + j;

            const inputElement = document.createElement('INPUT');
            inputElement.setAttribute('type', col.type);
            inputElement.setAttribute('id', colId);
            inputElement.style.width = col.fill + '%';
            
            const labelElement = document.createElement('INPUT');
            labelElement.setAttribute('for', colId);

            if (col.label) {
                const labelText = document.createTextNode(col.label);
                labelElement.appendChild(labelText);
            }

            if (col.value) {
                inputElement.setAttribute('value', col.value);
            }

            let click = () => {};
            let change = () => {};
            let keydown = () => {};

            if (col.script) eval(col.script);

            inputElement.addEventListener('click', click, false);
            inputElement.addEventListener('change', change, false);
            inputElement.addEventListener('keydown', keydown, false);

            colElement.appendChild(inputElement);

            rowElement.appendChild(colElement);
        });

        formTable.appendChild(rowElement);

        console.log(rowElement);
    });

    render(formTable, contentWrapper);
}

// Relieve parent node of now redundant children
function clearNode(node) {
    // While node has at least one child, remove first child
    while (node.firstChild) {
        console.log('Removing...');
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
