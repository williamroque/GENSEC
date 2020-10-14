"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elementController_1 = __importDefault(require("../elementController"));
class FileInputRow extends elementController_1.default {
    constructor(deleteCallback, path) {
        super('DIV', {
            classList: new Set(['file-input-path-container'])
        });
        this.deleteCallback = deleteCallback;
        this.path = path;
        this.seedTree();
    }
    getIndex() {
        let child = this.element;
        let nodeIndex = 0;
        while ((child = child.previousSibling) !== null) {
            nodeIndex++;
        }
        return nodeIndex;
    }
    seedTree() {
        this.addEventListener('click', e => {
            e.stopPropagation();
        }, null);
        const pathText = new elementController_1.default('SPAN', {
            classList: new Set(['file-input-path-text']),
            text: this.path
        });
        this.addChild(pathText);
        const deleteButton = new elementController_1.default('BUTTON', {
            classList: new Set(['icon', 'delete-button']),
            text: 'close'
        });
        deleteButton.addEventListener('click', function () {
            this.deleteCallback(this.nodeID, this.path);
            this.remove();
        }, this);
        this.addChild(deleteButton);
    }
}
exports.default = FileInputRow;
