"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const { app } = electron_1.remote;
const path = __importStar(require("path"));
const navigator_1 = __importDefault(require("../rjs/ui/navigator/navigator"));
const ipcr_1 = __importDefault(require("../rjs/communication/ipcr"));
const form_1 = __importDefault(require("../rjs/ui/form/form"));
const elementController_1 = __importDefault(require("../rjs/ui/elementController"));
const settings_1 = __importDefault(require("../rjs/ui/settings/settings"));
const connection_1 = __importDefault(require("../rjs/communication/connection"));
const table_1 = __importDefault(require("./ui/table/table"));
const sidebar = document.querySelector('#sidebar');
const mainContainer = document.querySelector('#main-wrapper');
const settingsContainer = document.querySelector('#settings-wrapper');
const settingsViewButton = document.querySelector('#show-settings-view');
const editViewButton = document.querySelector('#show-edit-view');
const buildViewButton = document.querySelector('#show-build-view');
const appDataPath = app.getPath('userData');
const certificatePath = path.join(appDataPath, 'cert', 'gensec.pem');
const systemPath = path.join(appDataPath, 'system');
settingsViewButton.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-full');
}, false);
let currentViewButton;
let navigationController;
let settings;
function changeActiveButton(button) {
    if (currentViewButton) {
        currentViewButton.classList.remove('view-button-active');
    }
    button.classList.add('view-button-active');
    currentViewButton = button;
}
buildViewButton.addEventListener('click', () => {
    changeActiveButton(buildViewButton);
    if (typeof settings !== 'undefined') {
        settings.disableShowButton();
    }
    ipcr_1.default.requestFilesystem(systemPath).then(system => {
        navigationController = new navigator_1.default(system, mainContainer, (manifest) => {
            if (typeof manifest === 'undefined')
                return;
            settings = new settings_1.default(manifest.defaultSettings, settingsContainer, settingsViewButton, manifest.programName, manifest.packageName);
            settings.activate();
            const form = new form_1.default(manifest, mainContainer, settings);
            form.activate();
            const buttonContainerController = new elementController_1.default('DIV', {
                classList: new Set(['action-button-container'])
            });
            const voltarButtonController = new elementController_1.default('BUTTON', {
                text: 'Voltar',
                classList: new Set(['form-button', 'action-button'])
            });
            voltarButtonController.addEventListener('click', navigationController.activate, navigationController);
            voltarButtonController.addEventListener('click', settings.disableShowButton, settings);
            buttonContainerController.addChild(voltarButtonController);
            const spacerController = new elementController_1.default('DIV', {
                classList: new Set(['spacer'])
            });
            buttonContainerController.addChild(spacerController);
            const executarButtonController = new elementController_1.default('BUTTON', {
                text: 'Executar',
                classList: new Set(['form-button', 'action-button'])
            });
            executarButtonController.addEventListener('click', function () {
                const values = form.valuesContainer;
                if (values.areAllValid()) {
                    let input = values.parse();
                    if ('allowedOutputExtensions' in manifest) {
                        input['output-path'] = ipcr_1.default.requestSaveDialog(manifest.allowedOutputExtensions);
                        if (!input['output-path'])
                            return;
                    }
                    ipcr_1.default.requestExecutePackage(manifest.programName, manifest.packageName, input);
                }
            }, this);
            buttonContainerController.addChild(executarButtonController);
            mainContainer.appendChild(buttonContainerController.element);
        });
        navigationController.activate();
    });
}, false);
editViewButton.addEventListener('click', () => {
    changeActiveButton(editViewButton);
    if (typeof settings !== 'undefined') {
        settings.disableShowButton();
    }
    ipcr_1.default.requestFilesystem(systemPath, ['requiresDatabaseAccess', true]).then(system => {
        navigationController = new navigator_1.default(system, mainContainer, (manifest) => {
            settings = new settings_1.default(manifest.defaultSettings, settingsContainer, settingsViewButton, manifest.programName, manifest.packageName);
            settings.activate();
            if (!('dataHeaders' in manifest))
                return;
            try {
                const headers = manifest.dataHeaders;
                const connection = new connection_1.default(manifest.programName, manifest.packageName, headers, settings.get('network', 'ip').setting, settings.get('network', 'port').setting, settings.get('credentials', 'username').setting, settings.get('credentials', 'password').setting, certificatePath);
                connection.connect().then(() => {
                    connection.getAll((err, data) => {
                        if (err)
                            throw err;
                        const table = new table_1.default(data, connection, headers, mainContainer, settings);
                        table.activate();
                        const buttonContainerController = new elementController_1.default('DIV', {
                            classList: new Set(['action-button-container'])
                        });
                        const voltarButtonController = new elementController_1.default('BUTTON', {
                            text: 'Voltar',
                            classList: new Set(['form-button', 'action-button'])
                        });
                        voltarButtonController.addEventListener('click', function () {
                            navigationController.activate.call(navigationController);
                            settings.disableShowButton.call(settings);
                            connection.close();
                        }, this);
                        buttonContainerController.addChild(voltarButtonController);
                        const spacerController = new elementController_1.default('DIV', {
                            classList: new Set(['spacer'])
                        });
                        buttonContainerController.addChild(spacerController);
                        const importButtonController = new elementController_1.default('BUTTON', {
                            text: 'Importar',
                            classList: new Set(['form-button', 'action-button'])
                        });
                        importButtonController.addEventListener('click', function () {
                            navigationController.activate.call(navigationController);
                            settings.disableShowButton.call(settings);
                            connection.attemptImportData.call(connection);
                        }, this);
                        buttonContainerController.addChild(importButtonController);
                        mainContainer.appendChild(buttonContainerController.element);
                    });
                }).catch(err => {
                    throw err;
                });
            }
            catch (err) {
                ipcr_1.default.requestDisplayErrorWindow(err);
            }
        });
        navigationController.activate();
    });
});
