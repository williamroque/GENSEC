import ElementController from '../elementController';

export default class TableCell extends ElementController {
    private readonly data: string;

    constructor(data: string) {
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
                text: this.data,
                classList: new Set(['data-table-cell-text'])
            }
        );
        this.addChild(textController);
    }
}