import Connection from '../../communication/connection';
import ElementController from '../elementController';
import Toggle from '../toggle';
import TableCell from './tableCell';

type Data = {[propName: string]: string}[];

export default class Table extends ElementController {
    private readonly bufferSize = 20;
    private readonly indexIncrement = 5;
    private readonly scrollPadding = 1;
    private readonly rowHeight = 56;

    private readonly data: Data;
    private readonly connection: Connection;
    private readonly headers: string[];
    private readonly container: HTMLDivElement;

    private tableBody?: ElementController;
    private tableRows: ElementController[];
    private index;

    constructor(data: Data | null, connection: Connection, headers: string[], container: HTMLDivElement) {
        super(
            'TABLE', {
                classList: new Set(['data-table'])
            }
        );

        this.data = data || [];
        this.connection = connection;
        this.headers = headers;
        this.container = container;

        this.tableRows = [];
        this.index = 0;

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

        const scrollbarController = new ElementController(
            'DIV', {
                classList: new Set(['data-table-scrollbar'])
            }
        );
        this.addChild(scrollbarController);
        const scrollbarElement = scrollbarController.element as HTMLDivElement;

        this.tableBody = new ElementController(
            'TBODY', {
                classList: new Set(['data-table-body'])
            }
        );
        for (let i = 0; i < this.data.length; i++) {
            const rowController = this.addRow(this.data[i]);

            if (i < this.bufferSize) {
                this.tableBody?.addChild(rowController);
            }
        }
        this.addChild(this.tableBody);

        this.tableBody.addEventListener('scroll', function(this: Table) {
            const tableBody = this.tableBody?.element as HTMLTableElement;

            const viewHeight = tableBody.clientHeight;
            const tableHeight = tableBody.scrollHeight;
            const scrollBottom = tableHeight - tableBody.scrollTop - viewHeight;

            const endIndex = this.index + this.bufferSize;

            if (scrollBottom < this.scrollPadding * this.rowHeight) {
                if (endIndex + this.indexIncrement < this.tableRows.length) {
                    this.tableRows.slice(this.index, this.index + this.indexIncrement).forEach(row => {
                        this.tableBody?.removeChild(row.nodeID as string);
                    });

                    this.tableRows.slice(endIndex, endIndex + this.indexIncrement).forEach(row => {
                        this.tableBody?.addChild(row);
                    });

                    tableBody.scrollBy(0, -this.rowHeight * this.indexIncrement + 10);

                    this.index += this.indexIncrement;
                } else if (endIndex < this.tableRows.length) {
                    this.tableRows.slice(endIndex).forEach(row => {
                        this.tableBody?.addChild(row);
                    });

                    this.index += this.indexIncrement;
                }
            } else if (tableBody.scrollTop < this.scrollPadding * this.rowHeight && this.index - this.indexIncrement >= 0) {
                this.tableRows.slice(
                    endIndex - this.indexIncrement,
                    endIndex
                ).forEach(row => {
                    if (typeof row.nodeID !== 'undefined') {
                        this.tableBody?.removeChild(row.nodeID);
                    }
                });

                this.tableRows.slice(this.index - this.indexIncrement, this.index).reverse().forEach(row => {
                    this.tableBody?.addChild(row, undefined, true);
                });

                this.index -= this.indexIncrement;

                tableBody.scrollBy(0, this.rowHeight * this.indexIncrement);
            }

            scrollbarElement.style.top = `${(this.index * this.rowHeight + tableBody.scrollTop) * (viewHeight - 10) / (this.tableRows.length * this.rowHeight)}px`;
        }, this);
    }

    addRow(dataRow: {[propName: string]: string}) {
        const rowController = new ElementController(
            'TR', {
                classList: new Set(['data-table-row'])
            }
        );
        rowController.dataProperties = dataRow;
        rowController.addEventListener('click', function(this: Table, e: Event) {
            const event = e as MouseEvent;
            event.stopPropagation();

            const deleteButton = new ElementController(
                'BUTTON', {
                    classList: new Set(['toggle-button']),
                    text: 'Deletar'
                }
            );
            deleteButton.addEventListener('click', function(this: Table) {
                this.tableRows.splice(this.index + rowController.getIndex(), 1);
                this.tableBody?.removeChild(rowController.nodeID as string);
                this.connection.remove(rowController.dataProperties as object, console.log);
            }, this);

            Toggle.show([deleteButton], event.clientX, event.clientY);
        }, this);

        for (const header of this.headers) {
            const tableCell = new TableCell(dataRow[header.replace(/\./g, '')]);

            rowController.addChild(tableCell);
        }

        this.tableRows.push(rowController);

        return rowController;
    }

    clearContainer() {
        let child;
        while (child = this.container.firstChild) {
            this.container.removeChild(child);
        }
    }

    activate() {
        this.clearContainer();
        this.container.appendChild(this.element as HTMLTableElement);
    }
}