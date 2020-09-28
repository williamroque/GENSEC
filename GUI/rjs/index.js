const { app } = require('electron').remote;
const path = require('path');

const Navigator = require('../rjs/ui/navigator/navigator');
const Communication = require('../rjs/communication/ipcr');
const Form = require('../rjs/ui/form/form');
const ElementController = require('../rjs/ui/elementController');

const mainContainer = document.querySelector('#main-wrapper');
const settingsContainer = document.querySelector('#settings-wrapper');

const tableViewButton = document.querySelector('#show-table-view');
const editViewButton = document.querySelector('#show-edit-view');
const buildViewButton = document.querySelector('#show-build-view');

const systemPath = path.join(app.getPath('userData'), 'system');

let currentViewButton, navigator;

function changeActiveButton(button) {
    if (currentViewButton) {
        currentViewButton.classList.remove('view-button-active');
    }
    button.classList.add('view-button-active');

    currentViewButton = button;
}

buildViewButton.addEventListener('click', e => {
    changeActiveButton(buildViewButton);

    Communication.requestFilesystem(systemPath, (_, system) => {
        navigator = new Navigator(system, mainContainer, manifest => {
            const form = new Form(manifest, mainContainer);
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
            voltarButtonController.addEventListener('click', navigator.activate, navigator);
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
            executarButtonController.addEventListener('click', function(e) {
                const values = form.valuesContainer;
                if (values.areAllValid()) {
                    console.log(values.parse(), form.schema);
                }
            }, this);
            buttonContainerController.addChild(executarButtonController);

            form.addChild(buttonContainerController);
        });
        navigator.activate();
    });
}, false);
