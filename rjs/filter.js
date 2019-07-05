const filterOption = document.querySelector('#filter');

function renderFilterTable(formData, form) {
    const tableElement = document.createElement('TABLE');
    tableElement.setAttribute('class', 'filter-table');

    const headerRowElement = document.createElement('TR');
    headerRowElement.setAttribute('class', 'filter-table-header-row');

    const headers = form.map(input => input.label);
    headers.forEach(header => {
        const headerElement = document.createElement('TH');
        headerElement.setAttribute('class', 'filter-table-header-column');

        const headerText = document.createTextNode(header);
        headerElement.appendChild(headerText);

        headerRowElement.appendChild(headerElement);
    });

    tableElement.appendchild(headerRowElement);

    dataBody = requestData(formData.id + '.csv');
    dataBody.forEach(row => {
        const rowElement = document.createElement('TR');
        rowElement.setAttribute('class', 'filter-table-row');

        row.forEach(col => {
            const columnElement = document.createElement('TD');
            columnElement.setAttribute('class', 'filter-table-column');

            const columnText = document.createTextNode(col);
            columnElement.appendChild(columnText);

            rowElement.appendChild(columnElement);
        });

        tableElement.appendChild(rowElement);
    });

    render(tableElement, contentWrapper);
}

filterOption.addEventListener('click', () => {
    currentActionElement.classList.remove('option-selected');
    filterOption.classList.add('option-selected');

    currentActionElement = filterOption;
    currentAction = Action.FILTER;

    
}, false);


