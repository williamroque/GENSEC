"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const url_1 = __importDefault(require("url"));
const path_1 = __importDefault(require("path"));
const electron_window_state_1 = __importDefault(require("electron-window-state"));
class Window {
    constructor(properties, HTMLPath, keepsState, dispatchOnReady) {
        this.properties = properties;
        this.HTMLPath = HTMLPath;
        this.properties.webPreferences = { nodeIntegration: true, enableRemoteModule: true };
        if (keepsState) {
            this.windowState = electron_window_state_1.default({
                defaultWidth: 1150,
                defaultHeight: 750
            });
            this.properties.width = this.windowState.width;
            this.properties.height = this.windowState.height;
        }
        this.dispatchOnReady = dispatchOnReady;
        this.window = null;
    }
    createWindow() {
        this.window = new electron_1.BrowserWindow(this.properties);
        this.window.loadURL(url_1.default.format({
            pathname: path_1.default.join(__dirname, `../../html/${this.HTMLPath}`),
            protocol: 'file:',
            slashes: true
        }));
        if (this.windowState) {
            this.windowState.manage(this.window);
        }
        this.window.on('closed', () => this.window = null);
        this.addWebListener('dom-ready', () => {
            if (typeof this.dispatchOnReady !== 'undefined') {
                this.dispatchWebEvent(...this.dispatchOnReady);
            }
        });
    }
    show() {
        var _a;
        (_a = this.window) === null || _a === void 0 ? void 0 : _a.show();
    }
    isNull() {
        return this.window === null;
    }
    addWebListener(event, callback) {
        var _a;
        (_a = this.window) === null || _a === void 0 ? void 0 : _a.webContents.once(event, callback);
    }
    dispatchWebEvent(event, message) {
        var _a;
        if (this.isNull()) {
            this.createWindow();
            this.addWebListener('dom-ready', () => {
                this.dispatchWebEvent(event, message);
            });
        }
        else {
            (_a = this.window) === null || _a === void 0 ? void 0 : _a.webContents.send(event, message);
        }
    }
    toggleDevTools() {
        var _a;
        (_a = this.window) === null || _a === void 0 ? void 0 : _a.webContents.toggleDevTools();
    }
}
exports.default = Window;
