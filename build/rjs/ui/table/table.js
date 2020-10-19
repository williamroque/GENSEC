"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elementController_1 = __importDefault(require("../elementController"));
const toggle_1 = __importDefault(require("../toggle"));
const tableCell_1 = __importDefault(require("./tableCell"));
class Table extends elementController_1.default {
    constructor(data, connection, headers, container) {
        super('TABLE', {
            classList: new Set(['data-table'])
        });
        this.bufferSize = 20;
        this.indexIncrement = 5;
        this.scrollPadding = 1;
        this.rowHeight = 56;
        this.data = data || [];
        this.connection = connection;
        this.headers = headers;
        this.container = container;
        this.tableRows = [];
        this.index = 0;
        this.seedTree();
    }
    seedTree() {
        var _a;
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
        const scrollbarController = new elementController_1.default('DIV', {
            classList: new Set(['data-table-scrollbar'])
        });
        this.addChild(scrollbarController);
        const scrollbarElement = scrollbarController.element;
        this.tableBody = new elementController_1.default('TBODY', {
            classList: new Set(['data-table-body'])
        });
        for (let i = 0; i < this.data.length; i++) {
            const rowController = this.addRow(this.data[i]);
            if (i < this.bufferSize) {
                (_a = this.tableBody) === null || _a === void 0 ? void 0 : _a.addChild(rowController);
            }
        }
        this.addChild(this.tableBody);
        this.tableBody.addEventListener('scroll', function () {
            var _a;
            const tableBody = (_a = this.tableBody) === null || _a === void 0 ? void 0 : _a.element;
            const viewHeight = tableBody.clientHeight;
            const tableHeight = tableBody.scrollHeight;
            const scrollBottom = tableHeight - tableBody.scrollTop - viewHeight;
            const endIndex = this.index + this.bufferSize;
            if (scrollBottom < this.scrollPadding * this.rowHeight) {
                if (endIndex + this.indexIncrement < this.tableRows.length) {
                    this.tableRows.slice(this.index, this.index + this.indexIncrement).forEach(row => {
                        var _a;
                        (_a = this.tableBody) === null || _a === void 0 ? void 0 : _a.removeChild(row.nodeID);
                    });
                    this.tableRows.slice(endIndex, endIndex + this.indexIncrement).forEach(row => {
                        var _a;
                        (_a = this.tableBody) === null || _a === void 0 ? void 0 : _a.addChild(row);
                    });
                    tableBody.scrollBy(0, -this.rowHeight * this.indexIncrement + 10);
                    this.index += this.indexIncrement;
                }
                else if (endIndex < this.tableRows.length) {
                    this.tableRows.slice(endIndex).forEach(row => {
                        var _a;
                        (_a = this.tableBody) === null || _a === void 0 ? void 0 : _a.addChild(row);
                    });
                    this.index += this.indexIncrement;
                }
            }
            else if (tableBody.scrollTop < this.scrollPadding * this.rowHeight && this.index - this.indexIncrement >= 0) {
                this.tableRows.slice(endIndex - this.indexIncrement, endIndex).forEach(row => {
                    var _a;
                    if (typeof row.nodeID !== 'undefined') {
                        (_a = this.tableBody) === null || _a === void 0 ? void 0 : _a.removeChild(row.nodeID);
                    }
                });
                this.tableRows.slice(this.index - this.indexIncrement, this.index).reverse().forEach(row => {
                    var _a;
                    (_a = this.tableBody) === null || _a === void 0 ? void 0 : _a.addChild(row, undefined, true);
                });
                this.index -= this.indexIncrement;
                tableBody.scrollBy(0, this.rowHeight * this.indexIncrement);
            }
            scrollbarElement.style.top = `${(this.index * this.rowHeight + tableBody.scrollTop) * (viewHeight - 10) / (this.tableRows.length * this.rowHeight)}px`;
        }, this);
    }
    addRow(dataRow) {
        const rowController = new elementController_1.default('TR', {
            classList: new Set(['data-table-row'])
        });
        rowController.dataProperties = dataRow;
        rowController.addEventListener('click', function (e) {
            const event = e;
            event.stopPropagation();
            const deleteButton = new elementController_1.default('BUTTON', {
                classList: new Set(['toggle-button']),
                text: 'Deletar'
            });
            deleteButton.addEventListener('click', function () {
                var _a;
                this.tableRows.splice(this.index + rowController.getIndex(), 1);
                console.log(rowController.nodeID);
                (_a = this.tableBody) === null || _a === void 0 ? void 0 : _a.removeChild(rowController.nodeID);
                this.connection.remove(rowController.dataProperties, console.log);
            }, this);
            toggle_1.default.show([deleteButton], event.clientX, event.clientY);
        }, this);
        for (const header of this.headers) {
            const tableCell = new tableCell_1.default(dataRow[header.replace(/\./g, '')]);
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
        this.container.appendChild(this.element);
    }
}
exports.default = Table;
