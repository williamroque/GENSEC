import ElementController from '../elementController';

export default class TableCell extends ElementController {
    constructor(data) {
        super(
            'TD', {
                classList: new Set(['data-table-cell'])
            }
        )

        this.data = data;

        this.seedTree();
    }

    seedTree() {
        const textController = new ElementController(
            'SPAN', {
                text: this.data.display,
                classList: new Set(['data-table-cell-text'])
            }
        );
        this.addChild(textController);
    }
}