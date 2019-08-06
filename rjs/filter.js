let promptVisible = false;

function hideMutatePrompt() {
    if (promptVisible) {
        mutatePrompt.style.top = '-500px';
        mutatePrompt.style.left = '-500px';
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        hideMutatePrompt();
    }
}, false);

document.addEventListener('click', hideMutatePrompt, false);

let currentPromptHandlers;

function handleRowClick(e) {
    e.stopPropagation();

    const promptHeight = mutatePrompt.offsetHeight;
    const promptWidth = mutatePrompt.offsetWidth;

    mutatePrompt.style.top = (
        e.pageY + promptHeight + 10 >= window.innerHeight ?
        e.pageY - promptHeight :
        e.pageY
    ) + 'px';

    mutatePrompt.style.left = (
        e.pageX + promptWidth + 10 >= window.innerWidth ?
        e.pageX - promptWidth :
        e.pageX
    ) + 'px';

    formIndex = e.currentTarget.getAttribute('data-index') | 0;

    if (currentPromptHandlers) {
        editButton.removeEventListener('click', currentPromptHandlers[0], false);
        deleteButton.removeEventListener('click', currentPromptHandlers[1], false);
    }

    const editHandler = () => {
        const data = [...this.childNodes].map(col => col.textContent);
        editRow(data);
    };

    const deleteHandler = () => {
        indexShifts.add(formIndex);
        handleWriteCode(requestDeleteRow(getRelativeIndex(formIndex), currentForm.id));
        this.remove();
    };

    editButton.addEventListener('click', editHandler, false);
    deleteButton.addEventListener('click', deleteHandler, false);

    currentPromptHandlers = [editHandler, deleteHandler];

    promptVisible = true;
}

function renderFilterTable(form, formData, filter) {
    let data;

    if (filter) {
        data = dataFull;
    } else {
        data = requestData(form.id);
        if (!handleWriteCode(data)) {
            data = data.split('\n').map(row => row.split(';'));
        } else {
            virtualPath.pop();
            isForm = false;
            update(false);
            return;
        }
        dataFull = data;
        filter = () => true;
    }

    const tableElement = document.createElement('TABLE');
    tableElement.setAttribute('class', 'filter-table');

    const headerRowElement = document.createElement('TR');
    headerRowElement.setAttribute('class', 'filter-table-header-row');

    const headers = formData.form.flat().filter(input => input.type === 'text' || input.type === 'textarea').map(input => input.label);

    headers.forEach(header => {
        const headerElement = document.createElement('TH');
        headerElement.setAttribute('class', 'filter-table-header-column');

        const headerText = document.createTextNode(header);
        headerElement.appendChild(headerText);

        headerRowElement.appendChild(headerElement);
    });

    tableElement.appendChild(headerRowElement);

    const tableBody = document.createElement('TBODY');
    tableBody.setAttribute('class', 'filter-table-body');

    data.forEach((row, i) => {
        if (filter(row)) {
            const rowElement = document.createElement('TR');
            rowElement.setAttribute('class', 'filter-table-row');
            rowElement.setAttribute('data-index', i);

            rowElement.addEventListener('click', handleRowClick, false);

            row.forEach(col => {
                const columnElement = document.createElement('TD');
                columnElement.setAttribute('class', 'filter-table-column');

                const columnText = document.createTextNode(col);
                columnElement.appendChild(columnText);

                rowElement.appendChild(columnElement);
            });

            tableBody.appendChild(rowElement);
        }
    });

    tableElement.appendChild(tableBody);

    render(tableElement, contentWrapper);
}

const filterOption = document.querySelector('#filter');
filterOption.addEventListener('click', () => {
    updateToolbarOption(filterOption, Actions.FILTER);
}, false);


