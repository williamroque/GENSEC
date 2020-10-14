"use strict";
const { app } = require('electron').remote;
const path = require('path');
const Navigator = require('../rjs/ui/navigator/navigator');
const Communication = require('../rjs/communication/ipcr');
const Form = require('../rjs/ui/form/form');
const ElementController = require('../rjs/ui/elementController');
const Settings = require('../rjs/ui/settings/settings');
const Connection = require('../rjs/communication/connection');
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
let currentViewButton, navigatorController, settings;
function changeActiveButton(button) {
    if (currentViewButton) {
        currentViewButton.classList.remove('view-button-active');
    }
    button.classList.add('view-button-active');
    currentViewButton = button;
}
buildViewButton.addEventListener('click', e => {
    changeActiveButton(buildViewButton);
    if (typeof settings !== 'undefined') {
        settings.disableShowButton();
    }
    Communication.requestFilesystem(systemPath).then(system => {
        navigatorController = new Navigator(system, mainContainer, manifest => {
            settings = new Settings(manifest.defaultSettings, settingsContainer, settingsViewButton, sidebar, manifest.programName, manifest.packageName);
            settings.activate();
            const form = new Form(manifest, mainContainer, settings);
            form.activate();
            const buttonContainerController = new ElementController('DIV', {
                classList: new Set(['action-button-container'])
            });
            const voltarButtonController = new ElementController('BUTTON', {
                text: 'Voltar',
                classList: new Set(['form-button', 'action-button'])
            });
            voltarButtonController.addEventListener('click', navigatorController.activate, navigatorController);
            voltarButtonController.addEventListener('click', settings.disableShowButton, settings);
            buttonContainerController.addChild(voltarButtonController);
            const spacerController = new ElementController('DIV', {
                classList: new Set(['spacer'])
            });
            buttonContainerController.addChild(spacerController);
            const executarButtonController = new ElementController('BUTTON', {
                text: 'Executar',
                classList: new Set(['form-button', 'action-button'])
            });
            executarButtonController.addEventListener('click', function (e) {
                const values = form.valuesContainer;
                if (values.areAllValid()) {
                    let input = values.parse();
                    if ('allowedOutputExtensions' in manifest) {
                        input['output-path'] = Communication.requestSaveDialog(manifest.allowedOutputExtensions);
                        if (!input['output-path'])
                            return;
                    }
                    Communication.requestExecutePackage(manifest.programName, manifest.packageName, input);
                }
            }, this);
            buttonContainerController.addChild(executarButtonController);
            form.addChild(buttonContainerController);
        });
        navigatorController.activate();
    });
}, false);
editViewButton.addEventListener('click', e => {
    changeActiveButton(editViewButton);
    if (typeof settings !== 'undefined') {
        settings.disableShowButton();
    }
    Communication.requestFilesystem(systemPath, ['requiresDatabaseAccess', true]).then((_, system) => {
        navigatorController = new Navigator(system, mainContainer, manifest => {
            settings = new Settings(manifest.defaultSettings, settingsContainer, settingsViewButton, sidebar, manifest.programName, manifest.packageName);
            settings.activate();
            try {
                const connection = new Connection(manifest.programName, settings.get('network', 'ip'), settings.get('network', 'port'), settings.get('credentials', 'username'), settings.get('credentials', 'password'), certificatePath);
                connection.connect().then(() => {
                    connection.getAll(manifest.packageName, data => {
                        console.log(data);
                        //const table = new Table();
                        //table.activate();
                        //const buttonContainerController = new ElementController(
                        //    'DIV', {
                        //    classList: new Set(['action-button-container'])
                        //}
                        //);
                        //const voltarButtonController = new ElementController(
                        //    'BUTTON', {
                        //    text: 'Voltar',
                        //    classList: new Set(['form-button', 'action-button'])
                        //}
                        //);
                        //voltarButtonController.addEventListener('click', navigator.activate, navigator);
                        //voltarButtonController.addEventListener('click', settings.disableShowButton, settings);
                        //buttonContainerController.addChild(voltarButtonController);
                        //table.addChild(buttonContainerController);
                    });
                }).catch(err => {
                    throw err;
                });
            }
            catch (err) {
                Communication.requestDisplayErrorWindow(err);
            }
        });
        navigatorController.activate();
    });
});
