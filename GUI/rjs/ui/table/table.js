const ElementController = require('../elementController');
const TableCell = require('./tableCell');

class Table extends ElementController {
    constructor(data, headers, container) {
        super(
            'TABLE', {
                classList: new Set(['data-table'])
            }
        );

        this.data = data;
        this.headers = headers;
        this.container = container;

        this.seedTree();
    }

    seedTree() {
        const headerRowController = new ElementController(
            'TR', {
                classList: new Set(['data-table-header-row'])
            }
        );
        for (const header of this.headers) {
            const headerCellController = new ElementController(
                'TH', {
                    text: header,
                    classList: new Set(['data-table-header-cell'])
                }
            );
            headerRowController.addChild(headerCellController);
        }
        this.addChild(headerRowController);

        for (const dataRow of this.data) {
            const rowController = new ElementController(
                'TR', {
                    classList: new Set(['data-table-row'])
                }
            );

            for (const dataCell of dataRow) {
                const tableCell = new TableCell(dataCell);

                rowController.addChild(tableCell);
            }

            this.addChild(rowController);
        }
    }

    clearContainer() {
        let child;
        while (child = this.container.firstChild) {
            this.container.removeChild(child);
        }
    }

    activate() {
        this.clearContainer();
        this.container.appendChild(this.element);
    }
}

module.exports = Table;
