"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elementController_1 = __importDefault(require("../elementController"));
const tableCell_1 = __importDefault(require("./tableCell"));
class Table extends elementController_1.default {
    constructor(data, headers, container) {
        super('TABLE', {
            classList: new Set(['data-table'])
        });
        this.data = data || [];
        this.headers = headers;
        this.container = container;
        this.seedTree();
    }
    seedTree() {
        const headerRowController = new elementController_1.default('TR', {
            classList: new Set(['data-table-header-row'])
        });
        for (const header of this.headers) {
            const headerCellController = new elementController_1.default('TH', {
                text: header,
                classList: new Set(['data-table-header-cell'])
            });
            headerRowController.addChild(headerCellController);
        }
        this.addChild(headerRowController);
        for (const dataRow of this.data) {
            const rowController = new elementController_1.default('TR', {
                classList: new Set(['data-table-row'])
            });
            for (const header of this.headers) {
                const tableCell = new tableCell_1.default(dataRow[header]);
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
exports.default = Table;
