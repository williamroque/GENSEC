"use strict";
const { dialog } = require('electron');

export default class Dialog {
    static createSaveDialog(filters) {
        return dialog.showSaveDialogSync({
            properties: ['openFile'],
            filters: filters
        });
    }
    static createOpenDialog(filters) {
        return dialog.showOpenDialogSync({
            properties: ['openFile'],
            filters: filters
        });
    }
    static showError(title, content) {
        dialog.showErrorBox(title, content);
    }
    static ask(question) {
        const answer = dialog.showMessageBoxSync({
            message: question,
            buttons: ['Sim', 'Não'],
            cancelId: 1
        });
        return answer === 0;
    }
}
