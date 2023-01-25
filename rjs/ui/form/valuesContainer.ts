import Settings from "../settings/settings";
import InputValue from '../inputValue';

export default class ValuesContainer {
    private readonly settingsInstance: Settings;
    private values: { [propName: string]: any };

    constructor(settingsInstance: Settings) {
        this.values = {};

        this.settingsInstance = settingsInstance;
    }

    update(value: any, id: string, group?: string, index?: number) {
        if (typeof group !== 'undefined') {
            if (!(group in this.values)) {
                this.values[group] = {};
            }

            if (!(id in this.values[group])) {
                this.values[group][id] = [];
            }

            if (typeof index !== 'undefined') {
                this.values[group][id][index] = value;
            } else {
                this.values[group][id] = value;
            }
        } else {
            if (!(id in this.values)) {
                this.values[id] = [];
            }

            if (typeof index !== 'undefined') {
                this.values[id][index] = value;
            } else {
                this.values[id] = value;
            }
        }
    }

    removeAtIndex(group: string, id: string, index: number) {
        if (group in this.values) {
            if (id in this.values[group] && Array.isArray(this.values[group][id])) {
                this.values[group][id].splice(index, 1);
            }
        } else {
            if (id in this.values && Array.isArray(this.values[id])) {
                this.values[id].splice(index, 1);
            }
        }
    }

    removeFromAll(id: string) {
        for (const [group, values] of Object.entries(this.values)) {
            if (id in values) delete this.values[group][id];
        }
    }

    areAllValid(obj = this.values) {
        let areValid = true;

        for (const value of Object.values(obj)) {
            if (value instanceof InputValue) {
                const isValid = value.test();

                if (!isValid) {
                    areValid = false;
                }
                value.setValidityClassCallback?.(isValid);
            } else if (typeof value === 'object' && value !== null) {
                if (!this.areAllValid(value)) {
                    areValid = false;
                }
            }
        }

        return areValid;
    }

    clean(value: any, typeTest: (s: string) => boolean) {
        if (typeof value === 'string') {
            if (this.settingsInstance.get('formulario', 'useDecimalDot')?.setting) {
                value = value.replace(/,/g, '');
            } else {
                value = value.replace(/\./g, '');
                value = value.replace(/,/g, '.')
            }
            return typeTest(value) ? value : value.replace(/\s/g, '').replace(/-/g, '/');
        }
        return value

    }

    cast(inputValue: InputValue) {
        if (inputValue.type === 'filePaths') {
            return Array.from(inputValue.content);
        }

        const content = this.clean(inputValue.content, inputValue.typeValid);
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

    parse(obj = this.values): object {
        return Object.fromEntries(Object.entries(obj).map(([key, value]) => {
            if (value instanceof InputValue) {
                return [key, this.cast(value)];
            } else if (Array.isArray(value)) {
                return [key, Object.values(this.parse(value))];
            }
            return [key, this.parse(value)];
        }));
    }
}