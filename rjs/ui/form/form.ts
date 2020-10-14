import ElementController from '../elementController';
import Input from './input';
import List, { ListProperties } from './list';
import FileInput, { FileInputProperties } from './fileInput';
import ValuesContainer from './valuesContainer';
import Settings from '../settings/settings';
import Manifest from '../../../mjs/filesystem/manifest';

export default class Form extends ElementController {
    private readonly schema: Manifest;
    private readonly container: HTMLDivElement;
    private readonly settingsInstance: Settings;

    readonly valuesContainer: ValuesContainer;

    constructor(schema: Manifest, container: HTMLDivElement, settingsInstance: Settings) {
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
                    rowSchema as unknown as ListProperties,
                    this.settingsInstance
                );

                rowController.addChild(list, rowSchema.id);
            } else if (rowSchema.type === 'file-input') {
                const fileInput = new FileInput(
                    this.valuesContainer,
                    rowSchema as unknown as FileInputProperties,
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
        this.container.appendChild(this.element as HTMLDivElement);
    }
}