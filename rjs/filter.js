function renderFilterTable(form, formData) {
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

    const data = requestData(form.id + '.csv');
    data.split('\n').forEach(row => {
        const rowElement = document.createElement('TR');
        rowElement.setAttribute('class', 'filter-table-row');

        row.split(';').forEach(col => {
            const columnElement = document.createElement('TD');
            columnElement.setAttribute('class', 'filter-table-column');

            const columnText = document.createTextNode(col);
            columnElement.appendChild(columnText);

            rowElement.appendChild(columnElement);
        });

        tableBody.appendChild(rowElement);
    });

    tableElement.appendChild(tableBody);

    render(tableElement, contentWrapper);
}

const filterOption = document.querySelector('#filter');
filterOption.addEventListener('click', () => {
    updateToolbarOption(filterOption, Actions.FILTER);
}, false);


