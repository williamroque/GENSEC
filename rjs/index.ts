import { remote } from 'electron';
const { app } = remote;

import * as path from 'path';

import Navigator from '../rjs/ui/navigator/navigator';
import Communication from '../rjs/communication/ipcr';
import Form from '../rjs/ui/form/form';
import ElementController from '../rjs/ui/elementController';
import Settings from '../rjs/ui/settings/settings';
import Connection from '../rjs/communication/connection';

import Manifest, { SettingsSchema } from '../mjs/filesystem/manifest';
import { System } from '../mjs/filesystem/filesystem';

const sidebar = document.querySelector('#sidebar') as HTMLDivElement;

const mainContainer = document.querySelector('#main-wrapper') as HTMLDivElement;
const settingsContainer = document.querySelector('#settings-wrapper') as HTMLDivElement;

const settingsViewButton = document.querySelector('#show-settings-view') as HTMLButtonElement;

const editViewButton = document.querySelector('#show-edit-view') as HTMLButtonElement;
const buildViewButton = document.querySelector('#show-build-view') as HTMLButtonElement;

const appDataPath = app.getPath('userData');
const certificatePath = path.join(appDataPath, 'cert', 'gensec.pem');
const systemPath = path.join(appDataPath, 'system');

settingsViewButton.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-full');
}, false);

let currentViewButton: HTMLButtonElement;
let navigationController: Navigator;
let settings: Settings;

function changeActiveButton(button: HTMLButtonElement) {
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

    Communication.requestFilesystem(systemPath).then(system => {
        navigationController = new Navigator(system as System, mainContainer, (manifest: Manifest) => {
            if (typeof manifest === 'undefined') return;

            settings = new Settings(
                manifest.defaultSettings as SettingsSchema,
                settingsContainer,
                settingsViewButton,
                manifest.programName,
                manifest.packageName
            );
            settings.activate();

            const form = new Form(manifest, mainContainer, settings);
            form.activate();

            const buttonContainerController = new ElementController(
                'DIV', {
                    classList: new Set(['action-button-container'])
                }
            );
            const voltarButtonController = new ElementController(
                'BUTTON', {
                    text: 'Voltar',
                    classList: new Set(['form-button', 'action-button'])
                }
            );
            voltarButtonController.addEventListener('click', navigationController.activate, navigationController);
            voltarButtonController.addEventListener('click', settings.disableShowButton, settings);
            buttonContainerController.addChild(voltarButtonController);

            const spacerController = new ElementController(
                'DIV', {
                    classList: new Set(['spacer'])
                }
            );
            buttonContainerController.addChild(spacerController);

            const executarButtonController = new ElementController(
                'BUTTON', {
                    text: 'Executar',
                    classList: new Set(['form-button', 'action-button'])
                }
            );
            executarButtonController.addEventListener('click', function() {
                const values = form.valuesContainer;
                if (values.areAllValid()) {
                    let input = values.parse() as { [propName: string]: any };

                    if ('allowedOutputExtensions' in manifest) {
                        input['output-path'] = Communication.requestSaveDialog(manifest.allowedOutputExtensions);

                        if (!input['output-path']) return;
                    }

                    Communication.requestExecutePackage(
                        manifest.programName,
                        manifest.packageName,
                        input
                    );
                }
            }, this);
            buttonContainerController.addChild(executarButtonController);

            form.addChild(buttonContainerController);
        });
        navigationController.activate();
    });
}, false);

editViewButton.addEventListener('click', () => {
    changeActiveButton(editViewButton);

    if (typeof settings !== 'undefined') {
        settings.disableShowButton();
    }

    Communication.requestFilesystem(systemPath, ['requiresDatabaseAccess', true]).then(system => {
        navigationController = new Navigator(system as System, mainContainer, (manifest: Manifest) => {
            settings = new Settings(
                manifest.defaultSettings as SettingsSchema,
                settingsContainer,
                settingsViewButton,
                manifest.programName,
                manifest.packageName
            );
            settings.activate();

            try {
                const connection = new Connection(
                    manifest.programName,
                    settings.get('network', 'ip').setting,
                    settings.get('network', 'port').setting,
                    settings.get('credentials', 'username').setting,
                    settings.get('credentials', 'password').setting,
                    certificatePath
                );
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
            } catch(err) {
                Communication.requestDisplayErrorWindow(err);
            }
        });

        navigationController.activate();
    });
});