"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const elementController_1 = __importDefault(require("../elementController"));
const inputValue_1 = __importDefault(require("../inputValue"));
class Input extends elementController_1.default {
    constructor(valuesContainer, properties, settingsInstance, listID, setAnchorCallback, getIndex) {
        super('DIV', {
            width: properties.width,
            classList: new Set(['form-cell'])
        });
        this.valuesContainer = valuesContainer;
        this.id = properties.id;
        this.label = properties.label;
        this.group = properties.group;
        this.type = properties.type;
        this.incrementGroup = properties.incrementGroup;
        this.disabled = properties.disabled;
        this.listID = listID;
        this.setAnchorCallback = setAnchorCallback;
        this.getIndex = getIndex;
        this.seedTree();
        this.value = new inputValue_1.default('', this.type, this.setValidityClassCallback.bind(this), settingsInstance);
    }
    seedTree() {
        var _a, _b, _c;
        const labelController = new elementController_1.default('LABEL', {
            text: this.label,
            classList: new Set(['form-input-label'])
        });
        if (this.disabled) {
            (_a = labelController.element) === null || _a === void 0 ? void 0 : _a.setAttribute('disabled', 'disabled');
        }
        this.addChild(labelController, 'label');
        const inputController = new elementController_1.default('INPUT', {
            classList: new Set(['form-input'])
        });
        if (this.disabled) {
            (_b = inputController.element) === null || _b === void 0 ? void 0 : _b.setAttribute('disabled', 'disabled');
        }
        inputController.addEventListener('keydown', this.handleKeyEvent, this);
        this.addChild(inputController, 'input');
        if (this.type === 'percentage' || this.type === 'percentageOptional') {
            const percentageLabelController = new elementController_1.default('LABEL', {
                text: '%',
                classList: new Set(['percentage-symbol'])
            });
            if (this.disabled) {
                (_c = percentageLabelController.element) === null || _c === void 0 ? void 0 : _c.setAttribute('disabled', 'disabled');
            }
            this.addChild(percentageLabelController, 'percentageSymbol');
            inputController.addClass('percentage-input');
        }
    }
    setValidityClassCallback(isValid) {
        const inputNode = this.query('input');
        const labelNode = this.query('label');
        const percentageLabelNode = this.query('percentageSymbol');
        if (!isValid) {
            inputNode.addClass('form-input-invalid');
            labelNode.addClass('form-input-label-invalid');
            percentageLabelNode === null || percentageLabelNode === void 0 ? void 0 : percentageLabelNode.addClass('percentage-symbol-invalid');
        }
        else {
            inputNode.removeClass('form-input-invalid');
            labelNode.removeClass('form-input-label-invalid');
            percentageLabelNode === null || percentageLabelNode === void 0 ? void 0 : percentageLabelNode.removeClass('percentage-symbol-invalid');
        }
    }
    updateField(key) {
        var _a, _b;
        const target = (_a = this.query('input')) === null || _a === void 0 ? void 0 : _a.element;
        const selStart = target.selectionStart;
        const selEnd = target.selectionEnd;
        const selLength = selEnd - selStart;
        let targetValue;
        if (key === 'Backspace') {
            let cursorOffset = 0;
            if (selLength > 0) {
                targetValue = this.setFieldValue('', [selStart, selEnd]);
            }
            else {
                targetValue = this.setFieldValue('', [selStart - 1, selEnd]);
                cursorOffset = 1;
            }
            target.setSelectionRange(selStart - cursorOffset, selStart - cursorOffset);
        }
        else {
            targetValue = this.setFieldValue(key, [selStart, selEnd]);
            target.setSelectionRange(selStart + 1, selStart + 1);
        }
        if (this.type === 'anualIncrement' || this.type === 'monthlyIncrement') {
            if (this.value.test()) {
                (_b = this.setAnchorCallback) === null || _b === void 0 ? void 0 : _b.call(this, this.incrementGroup, targetValue, this.type);
            }
        }
        return targetValue;
    }
    setFieldValue(value, range = [0, value.length]) {
        var _a;
        const target = (_a = this.query('input')) === null || _a === void 0 ? void 0 : _a.element;
        let targetValue = target.value.split('');
        targetValue.splice(range[0], range[1] - range[0], value);
        let valueString = targetValue.join('');
        target.value = valueString;
        this.updateFormValue(valueString);
        return valueString;
    }
    updateFormValue(value) {
        this.value.update(value);
        if (typeof this.listID !== 'undefined' && typeof this.getIndex !== 'undefined') {
            this.valuesContainer.update(this.value, this.listID, this.group, this.getIndex());
        }
        else {
            this.valuesContainer.update(this.value, this.id, this.group);
        }
        this.updateStyling();
    }
    updateStyling() {
        const inputNode = this.query('input');
        const labelNode = this.query('label');
        const percentageLabelNode = this.query('percentageSymbol');
        if (this.value.content !== '') {
            inputNode.addClass('form-input-active');
            labelNode.addClass('form-input-label-active');
            percentageLabelNode === null || percentageLabelNode === void 0 ? void 0 : percentageLabelNode.addClass('percentage-symbol-active');
        }
        else {
            inputNode.removeClass('form-input-active');
            labelNode.removeClass('form-input-label-active');
            percentageLabelNode === null || percentageLabelNode === void 0 ? void 0 : percentageLabelNode.removeClass('percentage-symbol-active');
        }
    }
    handleKeyEvent(e) {
        var _a, _b;
        const event = e;
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey || event.key === 'Backspace') {
            this.updateField(event.key);
            event.preventDefault();
        }
        else {
            if ((event.metaKey || event.ctrlKey) && event.key === 'v') {
                const target = (_a = this.query('input')) === null || _a === void 0 ? void 0 : _a.element;
                const selStart = target.selectionStart;
                const selEnd = target.selectionEnd;
                const text = electron_1.clipboard.readText();
                this.setFieldValue(text, [selStart, selEnd]);
                target.setSelectionRange(selStart + text.length, selStart + text.length);
            }
            else if ((event.metaKey || event.ctrlKey) && event.key === 'x') {
                const target = (_b = this.query('input')) === null || _b === void 0 ? void 0 : _b.element;
                const selStart = target.selectionStart;
                const selEnd = target.selectionEnd;
                electron_1.clipboard.writeText(target.value.slice(selStart, selEnd));
                this.updateField('');
            }
        }
    }
}
exports.default = Input;
