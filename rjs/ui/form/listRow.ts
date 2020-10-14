import Settings from "../settings/settings";
import Input from "./input";
import ValuesContainer from "./valuesContainer";
import ElementController from '../elementController';

export type SchemataType = [
    {
        id: string,
        label: string,
        group: string,
        type: string,
        disabled: boolean,
        width: number,
        incrementGroup: string,
        drawDefault?: string,
        initialOffset?: number
    }
];

export default class ListRow extends ElementController {
    private readonly valuesContainer: ValuesContainer;
    private readonly listID: string;
    private readonly inputSchemata: SchemataType;
    private readonly settingsInstance: Settings;

    private deleteCallback: (index: number, nodeID: string) => void;
    private indexValue: number;
    private inputs: Array<Input>;
    private incrementInputs: { [propName: string]: any };
    private calibrateIndicesCallback?: () => void;
    private incrementAnchors?: { [propName: string]: any };
    private data?: { [propName: string]: any };

    constructor(valuesContainer: ValuesContainer, deleteCallback: (index: number, nodeID: string) => void, listID: string, inputSchemata: SchemataType, index: number, settingsInstance: Settings, incrementAnchors?: object, calibrateIndicesCallback?: () => void, data?: object) {
        super(
            'DIV', {
                classList: new Set(['form-row'])
            }
        );

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
            const inputCell = new Input(
                this.valuesContainer,
                cellSchema,
                this.settingsInstance,
                this.listID,
                this.setAnchor.bind(this),
                (function(this: ListRow) { return this.indexValue }).bind(this)
            );
            this.addChild(inputCell);

            if ('incrementGroup' in cellSchema) {
                const group = cellSchema.incrementGroup;

                if ('drawDefault' in cellSchema && typeof this.data !== 'undefined') {
                    this.setAnchor(group, this.addToDate(this.data[cellSchema.drawDefault as string], cellSchema.initialOffset as number), cellSchema.type);
                }

                this.incrementInputs[group] = inputCell;
            }

            this.inputs.push(inputCell);
        }

        const deleteButton = new ElementController(
            'BUTTON', {
                classList: new Set(['icon', 'delete-button']),
                text: 'close'
            }
        );
        deleteButton.addEventListener('click', function(this: ListRow) {
            this.deleteCallback(this.indexValue, this.nodeID as string);
        }, this);
        this.addChild(deleteButton);
    }

    setFormValues(values: [string] | [number]) {
        this.inputs.forEach((input: Input, i: number) => {
            if (typeof values !== 'undefined') {
                let formattedNum = values[i].toString();
                if ((input.type === 'float' || input.type === 'percentage') && this.settingsInstance.get('formulario', 'useDecimalDot').setting) {
                    formattedNum = formattedNum.replace(/\./g, ',');
                }

                input.setFieldValue(formattedNum);
            }
        });
    }

    addToDate(date: string, i: number) {
        const MONTHS = 'Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez'.split('|').map(m => m.toLowerCase());
        let [month, yearStr] = date.split('/');
        let year = parseInt(yearStr);

        const monthIndex = MONTHS.indexOf(month.toLowerCase());

        if (i < 0) {
            year -= Math.ceil(-((monthIndex + i) / 12));
        } else {
            year += (monthIndex + i) / 12 | 0;
        }

        month = MONTHS[(12 + monthIndex + i % 12) % 12];

        return `${month}/${year}`;

    }

    setAnchor(group: string, date: string, type: string) {
        if (typeof this.incrementAnchors !== 'undefined') {
            if (type === 'anualIncrement' ) {
                this.incrementAnchors[group] = {
                    anchor: (parseInt(date) - this.indexValue).toString(),
                    getDisplacement: (function (this: { [propName: string]: string }, i: number) {
                        return (parseInt(this.anchor) + i).toString();
                    }).bind(this.incrementAnchors[group])
                };
            } else if (type === 'monthlyIncrement') {
                this.incrementAnchors[group] = {
                    anchor: this.addToDate(date, -this.indexValue),
                    getDisplacement: (function (this: ListRow, i: number) {
                        return this.addToDate(date, i);
                    }).bind(this)
                };
            }
            this.calibrateIndicesCallback?.();
        }
    }

    set index(i: number) {
        this.indexValue = i;

        Object.entries(this.incrementInputs).forEach(([group, input]) => {
            if (typeof this.incrementAnchors !== 'undefined' && group in this.incrementAnchors) {
                (input as Input).setFieldValue(
                    this.incrementAnchors[group].getDisplacement(i)
                );
            }
        });
    }
}