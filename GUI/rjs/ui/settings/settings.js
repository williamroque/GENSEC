const settings = require('electron-settings');

const ElementController = require('../elementController');
const SettingsInput = require('./settingsInput');

class Settings extends ElementController {
    constructor(defaults, container) {
        super(
            'DIV', {
                classList: new Set(['settings'])
            }
        );

        this.setDefaults(defaults);
        this.container = container;

        this.seedTree();
    }

    seedTree() {
        for (const [section, sectionContent] of Object.entries(this.settings)) {
            const headerController = new ElementController(
                'H1', {
                    text: sectionContent.title,
                    classList: new Set(['settings-section-header'])
                }
            );
            this.addChild(headerController);

            for (const [entry, entryContent] of Object.entries(sectionContent.entries)) {
                entryContent = {
                    ...entryContent,
                    section: section,
                    entry: entry
                };

                const inputController = SettingsInput(
                    entryContent, this.set.bind(this)
                );
                this.addChild(inputController, entry);
            }
        }
    }

    setDefaults(defaults) {
        this.settings = defaults;

        for (const [section, sectionContent] of Object.entries(this.settings)) {
            if (!settings.hasSync(section)) {
                settings.setSync(section, sectionContent);
            } else {
                for (const [entry, entryContent] of Object.entries(sectionContent.entries)) {
                    if (!settings.hasSync(section)) {
                        settings.setSync(entry, entryContent);
                    } else {
                        this.settings[section].entries[entry] = settings.getSync(
                            [section, 'entries', entry]
                        );
                    }
                }
            }
        }
    }

    get(section, entry) {
        return this.settings[section].entries[entry];
    }

    set(section, entry, setting) {
        this.settings[section].entries[entry] = setting;
        settings.setSync([section, 'entries', entry], setting);
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

module.exports = Settings;
