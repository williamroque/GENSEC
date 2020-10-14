import { Extension } from "../filesystem/manifest";

import { dialog } from 'electron';

export default class Dialog {
    static createSaveDialog(filters: [Extension]) {
        return dialog.showSaveDialogSync({
            properties: [],
            filters: filters
        })
    }

    static createOpenDialog(filters: [Extension]) {
        return dialog.showOpenDialogSync({
            properties: [],
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
}