"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const input_1 = __importDefault(require("./input"));
const elementController_1 = __importDefault(require("../elementController"));
class ListRow extends elementController_1.default {
    constructor(valuesContainer, deleteCallback, listID, inputSchemata, index, settingsInstance, incrementAnchors, calibrateIndicesCallback, data) {
        super('DIV', {
            classList: new Set(['form-row'])
        });
        this.valuesContainer = valuesContainer;
        this.deleteCallback = deleteCallback;
        this.listID = listID;
        this.inputSchemata = inputSchemata;
        this.indexValue = index;
        this.incrementAnchors = incrementAnchors;
        this.calibrateIndicesCallback = calibrateIndicesCallback;
        this.data = data;
        this.inputs = [];
        this.incrementInputs = {};
        this.settingsInstance = settingsInstance;
        this.seedTree();
    }
    delete() {
        for (const cellSchema of this.inputSchemata) {
            this.valuesContainer.removeAtIndex(cellSchema.group, this.listID, this.indexValue);
        }
    }
    seedTree() {
        for (const cellSchema of this.inputSchemata) {
            const inputCell = new input_1.default(this.valuesContainer, cellSchema, this.settingsInstance, this.listID, this.setAnchor.bind(this), (function () { return this.indexValue; }).bind(this));
            this.addChild(inputCell);
            if ('incrementGroup' in cellSchema) {
                const group = cellSchema.incrementGroup;
                if ('drawDefault' in cellSchema && typeof this.data !== 'undefined') {
                    this.setAnchor(group, this.addToDate(this.data[cellSchema.drawDefault], cellSchema.initialOffset), cellSchema.type);
                }
                this.incrementInputs[group] = inputCell;
            }
            this.inputs.push(inputCell);
        }
        const deleteButton = new elementController_1.default('BUTTON', {
            classList: new Set(['icon', 'delete-button']),
            text: 'close'
        });
        deleteButton.addEventListener('click', function () {
            this.deleteCallback(this.indexValue, this.nodeID);
        }, this);
        this.addChild(deleteButton);
    }
    setFormValues(values) {
        this.inputs.forEach((input, i) => {
            if (typeof values !== 'undefined') {
                let formattedNum = values[i].toString();
                if ((input.type === 'float' || input.type === 'percentage') && this.settingsInstance.get('formulario', 'useDecimalDot').setting) {
                    formattedNum = formattedNum.replace(/\./g, ',');
                }
                input.setFieldValue(formattedNum);
            }
        });
    }
    addToDate(date, i) {
        const MONTHS = 'Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez'.split('|').map(m => m.toLowerCase());
        let [month, yearStr] = date.split('/');
        let year = parseInt(yearStr);
        const monthIndex = MONTHS.indexOf(month.toLowerCase());
        if (i < 0) {
            year -= Math.ceil(-((monthIndex + i) / 12));
        }
        else {
            year += (monthIndex + i) / 12 | 0;
        }
        month = MONTHS[(12 + monthIndex + i % 12) % 12];
        return `${month}/${year}`;
    }
    setAnchor(group, date, type) {
        var _a;
        if (typeof this.incrementAnchors !== 'undefined') {
            if (type === 'anualIncrement') {
                this.incrementAnchors[group] = {
                    anchor: (parseInt(date) - this.indexValue).toString(),
                    getDisplacement: (function (i) {
                        return (parseInt(this.anchor) + i).toString();
                    }).bind(this.incrementAnchors[group])
                };
            }
            else if (type === 'monthlyIncrement') {
                this.incrementAnchors[group] = {
                    anchor: this.addToDate(date, -this.indexValue),
                    getDisplacement: (function (i) {
                        return this.addToDate(date, i);
                    }).bind(this)
                };
            }
            (_a = this.calibrateIndicesCallback) === null || _a === void 0 ? void 0 : _a.call(this);
        }
    }
    set index(i) {
        this.indexValue = i;
        Object.entries(this.incrementInputs).forEach(([group, input]) => {
            if (typeof this.incrementAnchors !== 'undefined' && group in this.incrementAnchors) {
                input.setFieldValue(this.incrementAnchors[group].getDisplacement(i));
            }
        });
    }
}
exports.default = ListRow;
