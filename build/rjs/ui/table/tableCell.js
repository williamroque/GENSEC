"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elementController_1 = __importDefault(require("../elementController"));
class TableCell extends elementController_1.default {
    constructor(data) {
        super('TD', {
            classList: new Set(['data-table-cell'])
        });
        this.data = data;
        this.seedTree();
    }
    seedTree() {
        const textController = new elementController_1.default('SPAN', {
            text: this.data.display,
            classList: new Set(['data-table-cell-text'])
        });
        this.addChild(textController);
    }
}
exports.default = TableCell;
