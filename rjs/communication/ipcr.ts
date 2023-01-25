import { Extension } from "../../mjs/filesystem/manifest";

import { ipcRenderer } from 'electron';

export default class Communication {
    static requestFilesystem(path: string, expectedEntry?: [string, any]) {
        return new Promise(resolve => {
            ipcRenderer.once('send-filesystem', (_, system) => resolve(system));
            ipcRenderer.send('request-filesystem', path, expectedEntry);
        });
    }

    static requestExecutePackage(programName: string, packageName: string, input: object) {
        ipcRenderer.send('request-execute-package', programName, packageName, input);
    }

    static requestSaveDialog(extensions: Extension[]): string | undefined {
        return ipcRenderer.sendSync('request-save-dialog', extensions);
    }

    static requestOpenDialog(extensions: Extension[]): string | undefined {
        return ipcRenderer.sendSync('request-open-dialog', extensions);
    }

    static requestUpdateSearchEnabled(searchEnabled: boolean) {
        ipcRenderer.send('request-update-search-enabled', searchEnabled);
    }

    static requestUpdateEditEnabled(editEnabled: boolean) {
        ipcRenderer.send('request-update-edit-enabled', editEnabled);
    }

    static requestDisplayErrorWindow(err: string) {
        ipcRenderer.send('display-error-window', err);
    }

    static addListener(event: string, callback: () => any) {
        ipcRenderer.on(event, callback);
    }
}
