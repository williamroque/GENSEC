import ElementController from '../elementController';
import TableCell from './tableCell';

type Data = {[propName: string]: string}[];

export default class Table extends ElementController {
    private readonly data: Data;
    private readonly headers: string[];
    private readonly container: HTMLDivElement;

    constructor(data: Data | null, headers: string[], container: HTMLDivElement) {
        super(
            'TABLE', {
                classList: new Set(['data-table'])
            }
        );

        this.data = data || [];
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

            for (const header of this.headers) {
                const tableCell = new TableCell(dataRow[header.replace(/\./g, '')]);

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
        this.container.appendChild(this.element as HTMLTableElement);
    }
}