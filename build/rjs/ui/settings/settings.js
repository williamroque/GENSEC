"use strict";
const settings = require('electron-settings');
const ElementController = require('../elementController');
const SettingsInput = require('./settingsInput');
class Settings extends ElementController {
    constructor(defaults, container, showButton, sidebar, programName, packageName) {
        super('DIV', {
            classList: new Set(['settings'])
        });
        this.container = container;
        this.showButton = showButton;
        this.programName = programName;
        this.packageName = packageName;
        this.setDefaults(defaults);
        this.seedTree();
    }
    seedTree() {
        for (const [section, sectionContent] of Object.entries(this.settings)) {
            const headerController = new ElementController('H1', {
                text: sectionContent.title,
                classList: new Set(['settings-section-header'])
            });
            this.addChild(headerController);
            for (let [entry, entryContent] of Object.entries(sectionContent.entries)) {
                entryContent = Object.assign(Object.assign({}, entryContent), { section: section, entry: entry });
                const inputController = new SettingsInput(entryContent, this.set.bind(this), this);
                this.addChild(inputController, entry);
            }
        }
    }
    setDefaults(defaults) {
        this.settings = defaults;
        if (!settings.hasSync(this.programName)) {
            settings.setSync(this.programName, {});
        }
        if (!settings.hasSync([this.programName, this.packageName])) {
            settings.setSync([this.programName, this.packageName], this.settings);
        }
        for (const [section, sectionContent] of Object.entries(this.settings)) {
            const sectionPath = [this.programName, this.packageName, section];
            if (!settings.hasSync(sectionPath)) {
                settings.setSync(sectionPath, sectionContent);
            }
            else {
                for (const [entry, entryContent] of Object.entries(sectionContent.entries)) {
                    const entryPath = sectionPath.concat(['entries', entry]);
                    if (settings.hasSync(entryPath)) {
                        this.settings[section].entries[entry] = settings.getSync(entryPath, entry);
                    }
                    else {
                        settings.setSync(entryPath, entryContent);
                    }
                }
            }
        }
    }
    get(section, entry) {
        return this.settings[section].entries[entry];
    }
    set(section, entry, setting) {
        this.settings[section].entries[entry].setting = setting;
        settings.setSync([this.programName, this.packageName, section, 'entries', entry, 'setting'], setting);
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
module.exports = Settings;
