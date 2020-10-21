"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_settings_1 = __importDefault(require("electron-settings"));
const elementController_1 = __importDefault(require("../elementController"));
const settingsInput_1 = __importDefault(require("./settingsInput"));
class Settings extends elementController_1.default {
    constructor(defaults, container, showButton, programName, packageName) {
        super('DIV', {
            classList: new Set(['settings'])
        });
        this.container = container;
        this.showButton = showButton;
        this.programName = programName;
        this.packageName = packageName;
        this.settings = defaults;
        this.setDefaults();
        this.seedTree();
    }
    seedTree() {
        for (const [section, sectionContent] of Object.entries(this.settings)) {
            const headerController = new elementController_1.default('H1', {
                text: sectionContent.title,
                classList: new Set(['settings-section-header'])
            });
            this.addChild(headerController);
            for (let [entry, entryContent] of Object.entries(sectionContent.entries)) {
                entryContent = Object.assign(Object.assign({}, entryContent), { section: section, entry: entry });
                const inputController = new settingsInput_1.default(entryContent, this.set.bind(this), this);
                this.addChild(inputController, entry);
            }
        }
    }
    setDefaults() {
        if (!electron_settings_1.default.hasSync(this.programName)) {
            electron_settings_1.default.setSync(this.programName, {});
        }
        if (!electron_settings_1.default.hasSync([this.programName, this.packageName])) {
            electron_settings_1.default.setSync([this.programName, this.packageName], this.settings);
        }
        for (const [section, sectionContent] of Object.entries(this.settings)) {
            const sectionPath = [this.programName, this.packageName, section];
            if (!electron_settings_1.default.hasSync(sectionPath)) {
                electron_settings_1.default.setSync(sectionPath, sectionContent);
            }
            else {
                for (const [entry, entryContent] of Object.entries(sectionContent.entries)) {
                    const entryPath = sectionPath.concat(['entries', entry]);
                    if (electron_settings_1.default.hasSync(entryPath)) {
                        this.settings[section].entries[entry] = electron_settings_1.default.getSync(entryPath);
                    }
                    else {
                        electron_settings_1.default.setSync(entryPath, entryContent);
                    }
                }
            }
        }
    }
    get(section, entry) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a[section]) === null || _b === void 0 ? void 0 : _b.entries) === null || _c === void 0 ? void 0 : _c[entry];
    }
    set(section, entry, setting) {
        this.settings[section].entries[entry].setting = setting;
        electron_settings_1.default.setSync([this.programName, this.packageName, section, 'entries', entry, 'setting'], setting);
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
        this.enableShowButton();
    }
    enableShowButton() {
        this.showButton.classList.remove('settings-button-disabled');
        this.showButton.disabled = false;
    }
    disableShowButton() {
        this.showButton.classList.add('settings-button-disabled');
        this.showButton.disabled = true;
    }
}
exports.default = Settings;
