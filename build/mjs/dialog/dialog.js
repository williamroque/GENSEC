"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class Dialog {
    static createSaveDialog(filters) {
        return electron_1.dialog.showSaveDialogSync({
            properties: [],
            filters: filters
        });
    }
    static createOpenDialog(filters) {
        return electron_1.dialog.showOpenDialogSync({
            properties: [],
            filters: filters
        });
    }
    static ask(question) {
        const answer = electron_1.dialog.showMessageBoxSync({
            message: question,
            buttons: ['Sim', 'Não'],
            cancelId: 1
        });
        return answer === 0;
    }
}
exports.default = Dialog;
