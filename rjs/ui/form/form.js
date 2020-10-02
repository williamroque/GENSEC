const ElementController = require('../elementController');
const Input = require('./input');
const List = require('./list');
const FileInput = require('./fileInput');
const ValuesContainer = require('./valuesContainer');

class Form extends ElementController {
    constructor(schema, container, settingsInstance) {
        super(
            'DIV', {
                classList: new Set(['form'])
            }
        );

        this.schema = schema;
        this.container = container;

        this.settingsInstance = settingsInstance;

        this.valuesContainer = new ValuesContainer(settingsInstance);

        this.seedTree();
    }

    seedTree() {
        for (const rowSchema of this.schema.form) {
            const rowController = new ElementController(
                'DIV', {
                    classList: new Set(['form-row'])
                }
            );

            if (rowSchema.type === 'input-row') {
                for (const cellSchema of rowSchema.inputs) {
                    const inputCell = new Input(
                        this.valuesContainer,
                        cellSchema,
                        this.settingsInstance
                    );

                    rowController.addChild(
                        inputCell,
                        (cellSchema.group ? `${cellSchema.group}=` : '') + cellSchema.id
                    );
                    inputCell.updateFormValue('');
                }
            } else if (rowSchema.type === 'list') {
                const list = new List(
                    this.valuesContainer,
                    rowSchema,
                    this.settingsInstance
                );

                rowController.addChild(list, rowSchema.id);
            } else if (rowSchema.type === 'file-input') {
                const fileInput = new FileInput(
                    this.valuesContainer,
                    rowSchema,
                    this,
                    this.settingsInstance
                );
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
module.exports = Form;
