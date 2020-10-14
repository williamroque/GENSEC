"use strict";
class InputValue {
    constructor(content, type, setValidityClassCallback, settings) {
        const testFloat = s => settings.get('formulario', 'useDecimalDot').setting ?
            /^\d[\d,]*(\.\d+)?$/.test(s.trim()) :
            /^\d[\d\.]*(,\d+)?$/.test(s.trim());
        const datePattern = /^(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)\/\d{4}$/i;
        this.typeSystem = {
            int: s => /^\d[\d\.]*$/.test(s.trim()),
            float: testFloat,
            percentage: testFloat,
            percentageOptional: s => s.trim() === '' || testFloat(s.trim()),
            dateString: s => datePattern.test(s.trim()),
            filePaths: s => this.content.size > 0,
            anualIncrement: s => /^\d{4}$/.test(s.trim()),
            monthlyIncrement: s => datePattern.test(s.trim()),
            ipAddress: s => /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(s.trim()),
            port: s => /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/.test(s.trim()),
            checkbox: s => typeof s === 'boolean',
            username: s => /^[A-Za-z_]+$/.test(s.trim()),
            password: s => /^[A-Za-z_]+$/.test(s.trim())
        };
        this.content = content;
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
        this.content = value;
    }
    test() {
        return this.typeValid(this.content);
    }
}
module.exports = InputValue;
