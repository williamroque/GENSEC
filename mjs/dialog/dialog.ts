import { dialog, ipcMain } from 'electron';
import crypto from 'crypto';

import { Extension } from "../filesystem/manifest";
import Window from '../browser/window';

export default class Dialog {
    static createSaveDialog(filters: Extension[]) {
        return dialog.showSaveDialogSync({
            properties: [],
            filters: filters
        })
    }

    static createOpenDialog(filters: Extension[]) {
        return dialog.showOpenDialogSync({
            properties: ['openFile'],
            filters: filters
        });
    }

    static ask(question: string) {
        const answer = dialog.showMessageBoxSync({
            message: question,
            buttons: ['Sim', 'Não'],
            cancelId: 1
        });
        return answer === 0;
    }

    static passwordPrompt(passwordHash: string) {
        return new Promise(resolve => {
            const promptWindow = new Window({
                width: 300,
                height: 200,
                frame: false,
                resizable: false,
                backgroundColor: '#171616'
            }, '../html/password.html', false);
            promptWindow.createWindow();

            ipcMain.on('submit-password', (_, password) => {
                const hash = crypto.createHash('sha256');
                hash.update(password);
                resolve(hash.digest('hex') === passwordHash);

                promptWindow.window?.close();
            });
        });
    }
}
