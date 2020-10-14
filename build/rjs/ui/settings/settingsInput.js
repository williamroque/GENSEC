"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const elementController_1 = __importDefault(require("../elementController"));
const inputValue_1 = __importDefault(require("../inputValue"));
class SettingsInput extends elementController_1.default {
    constructor(entryContent, updateSettingCallback, settingsInstance) {
        super('DIV', {
            classList: new Set(['settings-input'])
        });
        this.title = entryContent.title;
        this.type = entryContent.type;
        this.section = entryContent.section;
        this.entry = entryContent.entry;
        this.updateSettingCallback = updateSettingCallback;
        this.value = new inputValue_1.default(entryContent.setting, entryContent.type, null, settingsInstance);
        this.seedTree();
        this.setFieldValue(entryContent.setting);
    }
    seedTree() {
        if (this.type === 'checkbox') {
            const labelController = new elementController_1.default('LABEL', {
                text: this.title,
                classList: new Set(['settings-checkbox-label'])
            });
            this.addChild(labelController, 'label');
            const inputController = new elementController_1.default('DIV', {
                classList: new Set(['settings-checkbox', 'icon'])
            });
            this.addChild(inputController, 'input');
            this.addEventListener('click', function () {
                this.setFieldValue(!this.value.content);
            }, this);
        }
        else {
            const labelController = new elementController_1.default('LABEL', {
                text: this.title,
                classList: new Set(['settings-text-label'])
            });
            this.addChild(labelController, 'label');
            const inputController = new elementController_1.default('INPUT', {
                classList: new Set(['settings-text-input'])
            });
            inputController.element.setAttribute('spellcheck', 'false');
            inputController.addEventListener('keydown', this.handleKeyEvent, this);
            this.addChild(inputController, 'input');
        }
    }
    updateField(key) {
        var _a;
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
            if (this.type === 'password') {
                target.setSelectionRange(target.value.length, target.value.length);
            }
            else {
                target.setSelectionRange(selStart + 1, selStart + 1);
            }
        }
        const isValid = this.value.test();
        if (isValid) {
            this.updateSettingCallback(this.section, this.entry, this.value.content);
        }
        this.setValidityClass(isValid);
        return targetValue;
    }
    setFieldValue(value, range) {
        const target = this.query('input');
        const targetElement = target.element;
        let targetValue;
        if (this.type === 'checkbox') {
            targetValue = value;
            target.setText(value ? 'check_circle' : 'check_circle_outline');
            this.updateSettingCallback(this.section, this.entry, value);
        }
        else {
            value = value;
            if (typeof range === 'undefined')
                range = [0, value.length];
            if (this.type === 'password') {
                if (value === '') {
                    targetValue = this.value.content.split('');
                    targetValue.splice(range[0], range[1] - range[0], '');
                    targetValue = targetValue.join('');
                    targetElement.value = '•'.repeat(targetValue.length);
                }
                else {
                    targetValue = range[1] - range[0] === value.length ? value : this.value.content + value;
                    targetElement.value += '•'.repeat(value.length);
                }
            }
            else {
                targetValue = targetElement.value.split('');
                targetValue.splice(range[0], range[1] - range[0], value);
                targetValue = targetValue.join('');
                targetElement.value = targetValue;
            }
        }
        console.log(targetValue);
        this.value.update(targetValue);
        this.updateStyling();
        return targetValue;
    }
    updateStyling() {
        const inputNode = this.query('input');
        const labelNode = this.query('label');
        const inputClass = 'settings-text-input-active';
        const labelClass = 'settings-text-label-active';
        if (this.value.content !== '') {
            inputNode.addClass(inputClass);
            labelNode.addClass(labelClass);
        }
        else {
            inputNode.removeClass(inputClass);
            labelNode.removeClass(labelClass);
        }
    }
    setValidityClass(isValid) {
        const inputNode = this.query('input');
        const labelNode = this.query('label');
        const inputClass = 'settings-input-invalid';
        const labelClass = 'settings-input-label-invalid';
        if (!isValid) {
            inputNode.addClass(inputClass);
            labelNode.addClass(labelClass);
        }
        else {
            inputNode.removeClass(inputClass);
            labelNode.removeClass(labelClass);
        }
    }
    handleKeyEvent(e) {
        var _a;
        const event = e;
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey || event.key === 'Backspace') {
            this.updateField(event.key);
            event.preventDefault();
        }
        else {
            const target = (_a = this.query('input')) === null || _a === void 0 ? void 0 : _a.element;
            const selStart = target.selectionStart;
            const selEnd = target.selectionEnd;
            if ((event.metaKey || event.ctrlKey) && event.key === 'v') {
                const text = electron_1.clipboard.readText();
                this.setFieldValue(text, [selStart, selEnd]);
                target.setSelectionRange(selStart + text.length, selStart + text.length);
            }
            else if ((event.metaKey || event.ctrlKey) && event.key === 'x') {
                electron_1.clipboard.writeText(target.value.slice(selStart, selEnd));
                this.updateField('');
            }
        }
    }
}
exports.default = SettingsInput;
