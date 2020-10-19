import ElementController from '../elementController';

type DeleteCallback = (id: string, path: string) => void;

export default class FileInputRow extends ElementController {
    private readonly path: string;

    private deleteCallback: DeleteCallback;

    constructor(deleteCallback: DeleteCallback, path: string) {
        super(
            'DIV', {
                classList: new Set(['file-input-path-container'])
            }
        );

        this.deleteCallback = deleteCallback;

        this.path = path;

        this.seedTree();
    }

    seedTree() {
        this.addEventListener('click', e => {
            e.stopPropagation();
        }, null);

        const pathText = new ElementController(
            'SPAN', {
                classList: new Set(['file-input-path-text']),
                text: this.path
            }
        );
        this.addChild(pathText);

        const deleteButton = new ElementController(
            'BUTTON', {
                classList: new Set(['icon', 'delete-button']),
                text: 'close'
            }
        );
        deleteButton.addEventListener('click', function(this: FileInputRow) {
            this.deleteCallback(this.nodeID as string, this.path);
            this.remove();
        }, this);
        this.addChild(deleteButton);
    }
}