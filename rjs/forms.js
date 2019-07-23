const mutateOption = document.querySelector('#edit-contract');

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
    console.log(input.tagName.toLowerCase(), input.value);
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

function renderForm(data, fileId) {
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

            if (col.type === 'submit') {
                click = (dom, e) => {
                    const data = Object.keys(dom).map(key => dom[key].value);
                    const returnCode = requestAddRow(data.slice(0, data.length - 1).join(';') + '|' + fileId);

                    switch (returnCode) {
                        case 'write_failed':
                            showMessagePrompt('Failed to write data.', 2500);
                            break;
                        case 'write_successful':
                            showMessagePrompt('Successfully wrote data.', 1600);
                            break;
                        default:
                            console.log('Invalid submit return code.');
                    }
                };
            }

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

mutateOption.addEventListener('click', () => {
    updateToolbarOption(mutateOption, Actions.MUTATE);
}, false);
