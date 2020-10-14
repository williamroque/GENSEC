import fs from 'fs';
import { remote } from 'electron';
const { dialog } = remote;

import ElementController from '../elementController';
import FileInputRow from './fileInputRow';
import InputValue from '../inputValue';
import List from './list';
import ValuesContainer from './valuesContainer';
import { InputProperties } from './input';
import Settings from '../settings/settings';
import { Extension } from '../../../mjs/filesystem/manifest';

interface ReadToRows {
    id: string,
    label: string,
    sync: boolean,
    drawFrom: string,
    inputs: [InputProperties]
}

export interface FileInputProperties {
    id: string,
    label: string,
    max: number,
    allowedExtensions: [Extension],
    readToRows?: ReadToRows
}

export default class FileInput extends ElementController {
    private readonly valuesContainer: ValuesContainer;
    private readonly parentNode: ElementController;
    private readonly settingsInstance: Settings;
    private readonly id: string;
    private readonly max: number;
    private readonly readToRows?: ReadToRows;
    private readonly allowedExtensions: [Extension];
    private readonly files: Set<string>;
    private readonly value: InputValue;

    private fileCount: number;
    private lists: Array<List>;

    constructor(valuesContainer: ValuesContainer, properties: FileInputProperties, parentNode: ElementController, settingsInstance: Settings) {
        super(
            'DIV', {
                text: properties.label,
                classList: new Set(['file-input'])
            }
        );

        this.valuesContainer = valuesContainer;
        this.parentNode = parentNode;

        this.settingsInstance = settingsInstance;

        this.id = properties.id;
        this.max = properties.max || Infinity;
        this.readToRows = properties.readToRows;
        this.allowedExtensions = properties.allowedExtensions;

        this.seedTree();

        this.fileCount = 0;
        this.files = new Set();

        this.value = new InputValue(this.files, 'filePaths', this.setValidityClassCallback.bind(this), settingsInstance);
        this.valuesContainer.update(this.value, this.id);

        this.lists = [];
    }

    seedTree() {
        this.addEventListener('click', function(this: FileInput) {
            const files = dialog.showOpenDialogSync({
                properties: ['openFile', 'multiSelections'],
                filters: this.allowedExtensions
            });

            if (files) {
                files.forEach(file => {
                    if (this.files.size + 1 <= this.max) {
                        this.addFile(file);
                    }
                });
            }
        }, this);

        this.addEventListener('dragover', function(this: FileInput, event: Event) {
            event.preventDefault();
            this.addClass('file-input-drag');
        }, this);

        this.addEventListener('drop', function(this: FileInput, e: Event) {
            const event = e as DragEvent;

            event.preventDefault();

            if (!event.dataTransfer) return;

            let allowedFiles = [];
            for (const file of Array.from(event.dataTransfer.files)) {
                const filePattern = /^.+\.([a-z]+)$/;

                const [path, extension] = file.path.match(filePattern) as Array<string>;

                if (this.allowedExtensions.map(x => x.extensions).flat().indexOf(extension) > -1) {
                    allowedFiles.push(path);
                }
            }

            if (this.files.size + allowedFiles.length > this.max) {
                allowedFiles = allowedFiles.slice(0, this.max - this.files.size);
            }

            for (const file of allowedFiles) {
                this.addFile(file);
            }

            this.removeClass('file-input-drag');
        }, this);

        this.addEventListener('dragleave', function(this: FileInput, event) {
            event.preventDefault();
            this.removeClass('file-input-drag');
        }, this);
    }

    addFile(file: string) {
        if (this.fileCount === 0) {
            this.toggleText();
            this.addClass('file-input-active');
        }

        this.fileCount++;

        const fileInputRow = new FileInputRow(
            this.deleteCallback.bind(this),
            file
        );
        this.addChild(fileInputRow);

        if (typeof this.readToRows !== 'undefined') {
            const data = JSON.parse(fs.readFileSync(file).toString());

            this.lists.forEach(list => {
                list.remove();
            });
            this.lists = [];

            Object.entries(data[this.readToRows.drawFrom]).forEach(([serie, rows]) => {
                const rowController = new ElementController(
                    'DIV', {
                        classList: new Set(['form-row'])
                    }
                );

                const rowSchema = JSON.parse(JSON.stringify(this.readToRows));
                rowSchema.label = rowSchema.label.replace('{}', serie);
                rowSchema.id = rowSchema.id.replace('{}', serie);

                const list = new List(
                    this.valuesContainer,
                    rowSchema,
                    this.settingsInstance,
                    this.lists,
                    data
                );

                if (this.readToRows?.sync) {
                    list.buttonController?.addEventListener('click', function (this: FileInput, e: Event) {
                        const event = e as MouseEvent;

                        for (const list of this.lists) {
                            if (list.element !== (event.currentTarget as HTMLButtonElement).parentNode) {
                                list.addRow();
                            }
                        }
                    }, this);
                }

                this.lists.push(list);

                rowController.addChild(
                    list,
                    rowSchema.id
                );
                this.parentNode.addChild(rowController);

                for (const row of (rows as [[number]])) {
                    list.addRow(row);
                }
            });
        }

        this.files.add(file);
        this.value.update(this.files);

        this.valuesContainer.update(this.value, this.id);
    }

    deleteCallback(id: string, path: string) {
        this.files.delete(path);

        if (--this.fileCount < 1) {
            this.toggleText();
            this.removeClass('file-input-active');
        }
        this.removeChild(id);
    }

    setValidityClassCallback(isValid: boolean) {
        if (!isValid) {
            this.addClass('file-input-invalid');
        } else {
            this.removeClass('file-input-invalid');
        }
    }
}
