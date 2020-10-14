"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
const { dialog } = electron_1.remote;
const elementController_1 = __importDefault(require("../elementController"));
const fileInputRow_1 = __importDefault(require("./fileInputRow"));
const inputValue_1 = __importDefault(require("../inputValue"));
const list_1 = __importDefault(require("./list"));
class FileInput extends elementController_1.default {
    constructor(valuesContainer, properties, parentNode, settingsInstance) {
        super('DIV', {
            text: properties.label,
            classList: new Set(['file-input'])
        });
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
        this.value = new inputValue_1.default(this.files, 'filePaths', this.setValidityClassCallback.bind(this), settingsInstance);
        this.valuesContainer.update(this.value, this.id);
        this.lists = [];
    }
    seedTree() {
        this.addEventListener('click', function () {
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
        this.addEventListener('dragover', function (event) {
            event.preventDefault();
            this.addClass('file-input-drag');
        }, this);
        this.addEventListener('drop', function (e) {
            const event = e;
            event.preventDefault();
            if (!event.dataTransfer)
                return;
            let allowedFiles = [];
            for (const file of Array.from(event.dataTransfer.files)) {
                const filePattern = /^.+\.([a-z]+)$/;
                const [path, extension] = file.path.match(filePattern);
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
        this.addEventListener('dragleave', function (event) {
            event.preventDefault();
            this.removeClass('file-input-drag');
        }, this);
    }
    addFile(file) {
        if (this.fileCount === 0) {
            this.toggleText();
            this.addClass('file-input-active');
        }
        this.fileCount++;
        const fileInputRow = new fileInputRow_1.default(this.deleteCallback.bind(this), file);
        this.addChild(fileInputRow);
        if (typeof this.readToRows !== 'undefined') {
            const data = JSON.parse(fs_1.default.readFileSync(file).toString());
            this.lists.forEach(list => {
                list.remove();
            });
            this.lists = [];
            Object.entries(data[this.readToRows.drawFrom]).forEach(([serie, rows]) => {
                var _a, _b;
                const rowController = new elementController_1.default('DIV', {
                    classList: new Set(['form-row'])
                });
                const rowSchema = JSON.parse(JSON.stringify(this.readToRows));
                rowSchema.label = rowSchema.label.replace('{}', serie);
                rowSchema.id = rowSchema.id.replace('{}', serie);
                const list = new list_1.default(this.valuesContainer, rowSchema, this.settingsInstance, this.lists, data);
                if ((_a = this.readToRows) === null || _a === void 0 ? void 0 : _a.sync) {
                    (_b = list.buttonController) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function (e) {
                        const event = e;
                        for (const list of this.lists) {
                            if (list.element !== event.currentTarget.parentNode) {
                                list.addRow();
                            }
                        }
                    }, this);
                }
                this.lists.push(list);
                rowController.addChild(list, rowSchema.id);
                this.parentNode.addChild(rowController);
                for (const row of rows) {
                    list.addRow(row);
                }
            });
        }
        this.files.add(file);
        this.value.update(this.files);
        this.valuesContainer.update(this.value, this.id);
    }
    deleteCallback(id, path) {
        this.files.delete(path);
        if (--this.fileCount < 1) {
            this.toggleText();
            this.removeClass('file-input-active');
        }
        this.removeChild(id);
    }
    setValidityClassCallback(isValid) {
        if (!isValid) {
            this.addClass('file-input-invalid');
        }
        else {
            this.removeClass('file-input-invalid');
        }
    }
}
exports.default = FileInput;
