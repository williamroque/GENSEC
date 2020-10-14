"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inputValue_1 = __importDefault(require("../inputValue"));
class ValuesContainer {
    constructor(settingsInstance) {
        this.values = {};
        this.settingsInstance = settingsInstance;
    }
    update(value, id, group, index) {
        if (typeof group !== 'undefined') {
            if (!(group in this.values)) {
                this.values[group] = {};
            }
            if (!(id in this.values[group])) {
                this.values[group][id] = [];
            }
            if (typeof index !== 'undefined') {
                this.values[group][id][index] = value;
            }
            else {
                this.values[group][id] = value;
            }
        }
        else {
            if (!(id in this.values)) {
                this.values[id] = [];
            }
            if (typeof index !== 'undefined') {
                this.values[id][index] = value;
            }
            else {
                this.values[id] = value;
            }
        }
    }
    removeAtIndex(group, id, index) {
        if (group in this.values) {
            if (id in this.values[group] && Array.isArray(this.values[group][id])) {
                this.values[group][id].splice(index, 1);
            }
        }
        else {
            if (id in this.values && Array.isArray(this.values[id])) {
                this.values[id].splice(index, 1);
            }
        }
    }
    removeFromAll(id) {
        for (const [group, values] of Object.entries(this.values)) {
            if (id in values)
                delete this.values[group][id];
        }
    }
    areAllValid(obj = this.values) {
        var _a;
        let areValid = true;
        for (const value of Object.values(obj)) {
            if (value instanceof inputValue_1.default) {
                const isValid = value.test();
                if (!isValid) {
                    areValid = false;
                }
                (_a = value.setValidityClassCallback) === null || _a === void 0 ? void 0 : _a.call(value, isValid);
            }
            else if (typeof value === 'object' && value !== null) {
                if (!this.areAllValid(value)) {
                    areValid = false;
                }
            }
        }
        return areValid;
    }
    clean(value) {
        if (typeof value === 'string') {
            if (this.settingsInstance.get('formulario', 'useDecimalDot').setting) {
                value = value.replace(/,/g, '');
            }
            else {
                value = value.replace(/\./g, '');
                value = value.replace(/,/g, '.');
            }
            return value.replace(/\s/g, '').replace(/-/g, '/');
        }
        return value;
    }
    cast(inputValue) {
        if (inputValue.type === 'filePaths') {
            return Array.from(inputValue.content);
        }
        const content = this.clean(inputValue.content);
        switch (inputValue.type) {
            case 'int':
                return parseInt(content);
            case 'float':
                return parseFloat(content);
            case 'percentage':
                return parseFloat(content) / 100;
            case 'percentageOptional':
                return content === '' ? -1 : parseFloat(content) / 100;
            default:
                return content;
        }
    }
    parse(obj = this.values) {
        return Object.fromEntries(Object.entries(obj).map(([key, value]) => {
            if (value instanceof inputValue_1.default) {
                return [key, this.cast(value)];
            }
            else if (Array.isArray(value)) {
                return [key, Object.values(this.parse(value))];
            }
            return [key, this.parse(value)];
        }));
    }
}
exports.default = ValuesContainer;
