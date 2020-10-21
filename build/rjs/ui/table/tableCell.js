"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elementController_1 = __importDefault(require("../elementController"));
const input_1 = __importDefault(require("../form/input"));
class TableCell extends elementController_1.default {
    constructor(header, data, valuesContainer, exitCallback, settingsInstance) {
        super('TD', {
            classList: new Set(['data-table-cell'])
        });
        this.header = header;
        this.data = data;
        this.valuesContainer = valuesContainer;
        this.exitCallback = exitCallback;
        this.settingsInstance = settingsInstance;
        this.seedTree();
    }
    seedTree() {
        this.textController = new elementController_1.default('SPAN', {
            text: this.data,
            classList: new Set(['data-table-cell-text'])
        });
        this.addChild(this.textController);
        this.input = new input_1.default(this.valuesContainer, {
            id: this.header.replace(/\./g, ''),
            label: this.header,
            type: 'tableString',
            width: 100
        }, this.settingsInstance);
        this.input.setFieldValue(this.data);
        this.input.removeClass('form-cell');
        this.input.addClass('data-form-cell');
        this.input.addClass('hidden');
        this.input.addEventListener('keydown', function (e) {
            const { key } = e;
            if (key === 'Escape' || key === 'Enter') {
                this.exitCallback(key === 'Enter') && key === 'Enter' && this.textController.setText(this.input.getValue());
            }
        }, this);
        this.addChild(this.input);
    }
    enterEditMode() {
        var _a, _b;
        (_a = this.textController) === null || _a === void 0 ? void 0 : _a.addClass('hidden');
        (_b = this.input) === null || _b === void 0 ? void 0 : _b.removeClass('hidden');
    }
    exitEditMode() {
        var _a, _b;
        (_a = this.textController) === null || _a === void 0 ? void 0 : _a.removeClass('hidden');
        (_b = this.input) === null || _b === void 0 ? void 0 : _b.addClass('hidden');
    }
}
exports.default = TableCell;
