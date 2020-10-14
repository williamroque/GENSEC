"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elementController_1 = __importDefault(require("../elementController"));
const listRow_1 = __importDefault(require("./listRow"));
const toggle_1 = __importDefault(require("../toggle"));
class List extends elementController_1.default {
    constructor(valuesContainer, properties, settingsInstance, syncedLists, fileData) {
        super('DIV', {
            classList: new Set(['list-container'])
        });
        this.valuesContainer = valuesContainer;
        this.id = properties.id;
        this.label = properties.label;
        this.inputs = properties.inputs;
        this.max = properties.max || Infinity;
        this.min = properties.min || 0;
        this.settingsInstance = settingsInstance;
        this.syncedLists = syncedLists || [this];
        this.fileData = fileData;
        this.showStateComplementLabel = 'Esconder';
        this.addEventListener('contextmenu', function (e) {
            const event = e;
            const button = new elementController_1.default('BUTTON', {
                classList: new Set(['toggle-button']),
                'text': this.showStateComplementLabel
            });
            button.addEventListener('click', function () {
                this.toggleListItemsVisibility();
            }, this);
            toggle_1.default.show([button], event.pageX, event.pageY);
        }, this);
        this.listRows = [];
        this.incrementAnchors = {};
        this.seedTree();
    }
    calibrateIndices() {
        var _a;
        (_a = this.syncedLists) === null || _a === void 0 ? void 0 : _a.forEach(syncedList => {
            syncedList.incrementAnchors = this.incrementAnchors;
            syncedList.listRows.forEach((listRow, i) => {
                listRow.index = i;
            });
        });
    }
    deleteCallback(i, id) {
        var _a;
        if (this.listRows.length > this.min) {
            (_a = this.syncedLists) === null || _a === void 0 ? void 0 : _a.forEach(syncedList => {
                var _a, _b;
                const listRow = (_a = syncedList.query('list-items-container')) === null || _a === void 0 ? void 0 : _a.query(id);
                (_b = syncedList.listController) === null || _b === void 0 ? void 0 : _b.removeChild(id);
                syncedList.listRows.splice(i, 1);
                syncedList.calibrateIndices();
                listRow.delete.call(listRow);
            });
            this.calibrateIndices();
        }
    }
    seedTree() {
        this.listController = new elementController_1.default('DIV', {
            classList: new Set(['list-items-container'])
        });
        this.addChild(this.listController, 'list-items-container');
        this.moreContainerController = new elementController_1.default('DIV', {
            classList: new Set(['more-container', 'hidden'])
        });
        const moreController = new elementController_1.default('SPAN', {
            classList: new Set(['more']),
            text: '...'
        });
        this.moreContainerController.addChild(moreController);
        this.moreContainerController.addEventListener('click', function () {
            this.toggleListItemsVisibility();
        }, this);
        this.addChild(this.moreContainerController);
        this.buttonController = new elementController_1.default('BUTTON', {
            text: this.label,
            classList: new Set(['form-button'])
        });
        this.buttonController.addEventListener('click', function () {
            this.addRow();
        }, this);
        this.addChild(this.buttonController);
        while (this.listRows.length < this.min) {
            this.addRow();
        }
    }
    addRow(values) {
        var _a, _b;
        if (Object.values((_a = this.listController) === null || _a === void 0 ? void 0 : _a.getChildren()).length < this.max) {
            const listRow = new listRow_1.default(this.valuesContainer, this.deleteCallback.bind(this), this.id, this.inputs, this.listRows.length, this.settingsInstance, this.incrementAnchors, this.calibrateIndices.bind(this), this.fileData);
            (_b = this.listController) === null || _b === void 0 ? void 0 : _b.addChild(listRow);
            if (typeof values !== 'undefined') {
                listRow.setFormValues(values);
            }
            this.listRows.push(listRow);
            this.calibrateIndices();
        }
    }
    toggleListItemsVisibility() {
        var _a, _b, _c, _d;
        if (this.showStateComplementLabel === 'Esconder') {
            (_a = this.listController) === null || _a === void 0 ? void 0 : _a.addClass('hidden');
            (_b = this.moreContainerController) === null || _b === void 0 ? void 0 : _b.removeClass('hidden');
            this.showStateComplementLabel = 'Mostrar';
        }
        else {
            (_c = this.listController) === null || _c === void 0 ? void 0 : _c.removeClass('hidden');
            (_d = this.moreContainerController) === null || _d === void 0 ? void 0 : _d.addClass('hidden');
            this.showStateComplementLabel = 'Esconder';
        }
    }
    remove() {
        super.remove();
        this.valuesContainer.removeFromAll(this.id);
    }
}
exports.default = List;
