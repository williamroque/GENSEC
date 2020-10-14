"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InputValue {
    constructor(content, type, setValidityClassCallback, settings) {
        const testFloat = (s) => settings.get('formulario', 'useDecimalDot').setting ?
            /^\d[\d,]*(\.\d+)?$/.test(s) :
            /^\d[\d\.]*(,\d+)?$/.test(s);
        const datePattern = /^(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)\/\d{4}$/i;
        this.typeSystem = {
            int: s => /^\d[\d\.]*$/.test(s),
            float: testFloat,
            percentage: testFloat,
            percentageOptional: s => s === '' || testFloat(s),
            dateString: s => datePattern.test(s),
            filePaths: s => this.content.size > 0,
            anualIncrement: s => /^\d{4}$/.test(s),
            monthlyIncrement: s => datePattern.test(s),
            ipAddress: s => /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(s),
            port: s => /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/.test(s),
            checkbox: s => typeof s === 'boolean',
            username: s => /^[A-Za-z_]+$/.test(s),
            password: s => /^[A-Za-z_]+$/.test(s)
        };
        this.content = content;
        if (typeof this.content === 'string') {
            this.content = this.content.trim();
        }
        if (type in this.typeSystem) {
            this.type = type;
            this.typeValid = this.typeSystem[type];
        }
        else {
            throw new Error(`Unknown type '${type}'.`);
        }
        this.setValidityClassCallback = setValidityClassCallback;
    }
    update(value) {
        if (typeof value === 'string')
            value = value.trim();
        this.content = value;
    }
    test() {
        return this.typeValid(this.content);
    }
}
exports.default = InputValue;
