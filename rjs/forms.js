const mutateOption = document.querySelector('#edit-contract');

let currentlySelected;

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

function renderForm(data, fileID) {
    const formTable = document.createElement('DIV');
    formTable.setAttribute('class', 'form-table');

    let endScrollTimeout;
    formTable.addEventListener('scroll', () => {
        if (endScrollTimeout) {
            clearTimeout(endScrollTimeout);
        }
        formTable.classList.add('form-border-active');
        endScrollTimeout = setTimeout(() => {
            formTable.classList.remove('form-border-active');
        }, 1500);
    }, false);

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
                    rowElement.classList.add('textarea-row');
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
            let focus = (_, e) => {
                requestUpdateEditEnabled(true);
                currentlySelected = e.currentTarget;
            };
            let focusout = () => requestUpdateEditEnabled(false);

            if (col.type === 'submit') {
                click = (dom, e) => {
                    let data = {};
                    let dataCols = [];

                    Object.keys(dom).forEach(key => {
                        const value = dom[key].value;
                        data[key] = value;
                        dataCols.push(value);
                    });

                    if (col.checkSuite) {
                        const firstInvalid = Object.keys(data).find(key => {
                            const pattern = new RegExp(col.checkSuite[key] || '^[A-Za-zÀ-ÖØ-öø-ÿ|\\s]*$');
                            return !pattern.test(data[key]);
                        });

                        if (firstInvalid) {
                            showMessagePrompt('Invalid input for <b><i>' + firstInvalid + '</i></b> .', 2500);
                            return;
                        }
                    }

                    let returnCode;

                    let dataRow = dataCols.slice(0, dataCols.length - 1).join(';');
                    if (!isUpdate) {
                        returnCode = requestAddRow(dataRow, fileID);
                    } else {
                        if (formIndex !== undefined) {
                            returnCode = requestUpdateRow(getRelativeIndex(formIndex), dataRow, fileID);
                        }
                    }

                    handleReturnCode(returnCode);
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
            inputElement.addEventListener('focus', e => {
                focus(dom, e);
            });
            inputElement.addEventListener('focusout', e => {
                focusout(dom, e);
            });

            dom[col.label] = inputElement;

            colElement.appendChild(inputElement);

            rowElement.appendChild(colElement);
        });

        formTable.appendChild(rowElement);
    });

    render(formTable, contentWrapper);
}

function editRow(rowData) {
    if (Object.keys(currentForm).length) {
        isUpdate = true;
        updateToolbarOption(mutateOption, Actions.MUTATE, true);
        renderObject(pathData.id, currentForm, Actions.MUTATE);

        const domElements = Object.values(dom);
        domElements.slice(0, domElements.length - 1).forEach((elem, i) => {
            if (rowData[i]) {
                elem.value = rowData[i];
                refreshState(elem);
            }
        });
    }
}

ipcRenderer.on('copy', () => {
    clipboard.writeText(window.getSelection().toString());
});

ipcRenderer.on('paste', () => {
    document.execCommand('paste', clipboard.readText());
});

ipcRenderer.on('select-all', () => {
    currentlySelected.select();
});

mutateOption.addEventListener('click', () => {
    isUpdate = false;
    updateToolbarOption(mutateOption, Actions.MUTATE);
}, false);
