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
        const listItem = document.createElement('LI');
        // Set directory class for directory list item
        listItem.setAttribute('class', 'directory');
        // Set id of list item
        listItem.setAttribute('id', id);
        // Add text to list item
        listItem.appendChild(nameText);

        // Add list item to list of directories
        directoryList.appendChild(listItem);
    });

    // Add click event listener to each list item element
    directoryList.childNodes.forEach(node => {
        node.addEventListener('click', e => {
            // Add file (directory/form) name to virtual path
            virtualPath.push(node.innerText);

            // Selected file
            const id = e.target.id;
            const fileObject = pathData.find(file => file.id === id);

            if (fileObject.type === 'directory') {
                pathData = fileObject.content;
                update(true);
            } else {
                let data = [];
                if (fileObject.location === 'remote') {
                    data = JSON.parse(fs.readFileSync('forms/' + fileObject.path));

                } else {
                    data = fileObject.form;
                }
                update(false);
                renderForm(data);
            }
        }, false);
    });
}

function addInputClass(className, index, input) {
    input
        .parentNode
        .childNodes[index]
        .classList
        .add(className);
}

function removeInputClass(className, index, input) {
    input
        .parentNode
        .childNodes[index]
        .classList
        .remove(className);
}

function refreshState(input) {
    if (input.tagName.toLowerCase() === 'input' && input.type === 'text') {
        if (input.value !== '') {
            addInputClass('form-text-input-label-active', 0, input);
            addInputClass('form-text-input-active', 1, input);
        } else {
            removeInputClass('form-text-input-label-active', 0, input);
            removeInputClass('form-text-input-active', 1, input);
        }
    } else if (input.tagName.toLowerCase() === 'textarea') {
        if (input.value !== '') {
            addInputClass('form-textarea-label-active', 0, input);
            addInputClass('form-textarea-active', 1, input);
        } else {
            removeInputClass('form-textarea-label-active', 0, input);
            removeInputClass('form-textarea-active', 1, input);
        }
    }
}

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
            let change = (_, e) => refreshState(e.target);
            let keydown = () => {};

            if (col.script) {
                eval(col.script.join('\n'));
            }

            inputElement.addEventListener('click', e => {
                click(dom, e);
            }, false);
            inputElement.addEventListener('change', e => {
                change(dom, e);
            }, false);
            inputElement.addEventListener('keydown', e => {
                keydown(dom, e);
            }, false);

            dom[col.label] = inputElement;

            colElement.appendChild(inputElement);

            rowElement.appendChild(colElement);
        });

        formTable.appendChild(rowElement);
    });

    render(formTable, contentWrapper);
}
