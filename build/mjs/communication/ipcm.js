"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const electron_settings_1 = __importDefault(require("electron-settings"));
const filesystem_1 = __importDefault(require("../filesystem/filesystem"));
const python_1 = __importDefault(require("../python"));
const dialog_1 = __importDefault(require("../dialog/dialog"));
const window_1 = __importDefault(require("../browser/window"));
class Communication {
    static setDefaults(menu) {
        electron_1.ipcMain.on('request-filesystem', (event, path, expectedEntry) => {
            event.reply('send-filesystem', (new filesystem_1.default(path, expectedEntry)).system);
        });
        electron_1.ipcMain.on('request-execute-package', (_, programName, packageName, input) => {
            python_1.default.run([path_1.default.join(electron_1.app.getPath('userData'), 'system', programName, packageName, 'main.py')], input, electron_settings_1.default.getSync([programName, packageName, 'janela', 'entries', 'dataWindowClosesOnFinish', 'setting']) === true);
        });
        electron_1.ipcMain.on('request-save-dialog', (event, extensions) => {
            event.returnValue = dialog_1.default.createSaveDialog(extensions);
        });
        electron_1.ipcMain.on('request-update-search-enabled', (_, searchEnabled) => {
            var _a, _b;
            if (typeof ((_b = (_a = menu === null || menu === void 0 ? void 0 : menu.items[2]) === null || _a === void 0 ? void 0 : _a.submenu) === null || _b === void 0 ? void 0 : _b.items[0]) !== 'undefined') {
                menu.items[2].submenu.items[0].enabled = searchEnabled;
            }
        });
        electron_1.ipcMain.on('request-update-edit-enabled', (_, editEnabled) => {
            var _a, _b;
            if (typeof ((_b = (_a = menu === null || menu === void 0 ? void 0 : menu.items[1]) === null || _a === void 0 ? void 0 : _a.submenu) === null || _b === void 0 ? void 0 : _b.items) !== 'undefined') {
                menu.items[1].submenu.items.forEach(elem => {
                    if (elem.type !== 'separator') {
                        elem.enabled = editEnabled;
                    }
                });
            }
        });
        electron_1.ipcMain.on('display-error-window', (_, err) => {
            const errorWindow = new window_1.default({
                width: 820,
                height: 700,
                minWidth: 400,
                minHeight: 600
            }, '../html/error.html', false);
            errorWindow.createWindow();
            errorWindow.dispatchWebEvent('error', err);
        });
    }
}
exports.default = Communication;
