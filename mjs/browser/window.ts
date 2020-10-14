import { BrowserWindow } from 'electron';
import url from 'url';
import path from 'path';

import windowStateKeeper, { State } from 'electron-window-state';
import { BrowserWindowConstructorOptions } from 'electron/main';

export default class Window {
    private readonly properties: BrowserWindowConstructorOptions;
    private readonly HTMLPath: string;
    private readonly windowState?: State;
    private readonly dispatchOnReady?: [string, string];

    window: BrowserWindow | null;

    constructor(properties: BrowserWindowConstructorOptions, HTMLPath: string, keepsState: boolean, dispatchOnReady?: [string, string]) {
        this.properties = properties;
        this.HTMLPath = HTMLPath;

        this.properties.webPreferences = { nodeIntegration: true, enableRemoteModule: true };

        if (keepsState) {
            this.windowState = windowStateKeeper({
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
        this.window = new BrowserWindow(this.properties);
        this.window.loadURL(url.format({
            pathname: path.join(__dirname, `../../html/${this.HTMLPath}`),
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
        this.window?.show();
    }

    isNull() {
        return this.window === null;
    }

    addWebListener(event: string, callback: () => void) {
        this.window?.webContents.once(event as any, callback);
    }

    dispatchWebEvent(event: string, message?: string) {
        if (this.isNull()) {
            this.createWindow();
            this.addWebListener('dom-ready', () => {
                this.dispatchWebEvent(event, message);
            });
        } else {
            this.window?.webContents.send(event, message);
        }
    }

    toggleDevTools() {
        this.window?.webContents.toggleDevTools();
    }
}
