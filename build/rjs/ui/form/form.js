"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elementController_1 = __importDefault(require("../elementController"));
const input_1 = __importDefault(require("./input"));
const list_1 = __importDefault(require("./list"));
const fileInput_1 = __importDefault(require("./fileInput"));
const valuesContainer_1 = __importDefault(require("./valuesContainer"));
class Form extends elementController_1.default {
    constructor(schema, container, settingsInstance) {
        super('DIV', {
            classList: new Set(['form'])
        });
        this.schema = schema;
        this.container = container;
        this.settingsInstance = settingsInstance;
        this.valuesContainer = new valuesContainer_1.default(settingsInstance);
        this.seedTree();
    }
    seedTree() {
        for (const rowSchema of this.schema.form) {
            const rowController = new elementController_1.default('DIV', {
                classList: new Set(['form-row'])
            });
            if (rowSchema.type === 'input-row') {
                for (const cellSchema of rowSchema.inputs) {
                    const inputCell = new input_1.default(this.valuesContainer, cellSchema, this.settingsInstance);
                    rowController.addChild(inputCell, (cellSchema.group ? `${cellSchema.group}=` : '') + cellSchema.id);
                    inputCell.updateFormValue('');
                }
            }
            else if (rowSchema.type === 'list') {
                const list = new list_1.default(this.valuesContainer, rowSchema, this.settingsInstance);
                rowController.addChild(list, rowSchema.id);
            }
            else if (rowSchema.type === 'file-input') {
                const fileInput = new fileInput_1.default(this.valuesContainer, rowSchema, this, this.settingsInstance);
                rowController.addChild(fileInput, rowSchema.id);
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
exports.default = Form;
