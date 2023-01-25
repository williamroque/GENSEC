import ElementController from '../elementController';
import Input from '../form/input';
import ValuesContainer from '../form/valuesContainer';
import Settings from '../settings/settings';

export default class TableCell extends ElementController {
    private readonly data: string;
    private readonly valuesContainer: ValuesContainer;
    private readonly settingsInstance: Settings;
    private readonly header: string;

    private textController?: ElementController;
    private input?: Input;
    private exitCallback: (doesEdit: boolean) => boolean;

    constructor(header: string, data: string, valuesContainer: ValuesContainer, exitCallback: (doesEdit: boolean) => boolean, settingsInstance: Settings) {
        super(
            'TD', {
                classList: new Set(['data-table-cell'])
            }
        )

        this.header = header;
        this.data = data;
        this.valuesContainer = valuesContainer;
        this.exitCallback = exitCallback;
        this.settingsInstance = settingsInstance;

        this.seedTree();
    }

    seedTree() {
        this.textController = new ElementController(
            'SPAN', {
                text: this.data,
                classList: new Set(['data-table-cell-text'])
            }
        );
        this.addChild(this.textController);

        this.input = new Input(
            this.valuesContainer,
            {
                id: this.header.replace(/\./g, ''),
                label: this.header,
                type: 'tableString',
                width: 100
            },
            this.settingsInstance
        );

        this.input.setFieldValue(this.data);

        this.input.removeClass('form-cell');
        this.input.addClass('data-form-cell');
        this.input.addClass('hidden');

        this.input.addEventListener('keydown', function(this: TableCell, e: Event) {
            const { key } = e as KeyboardEvent;
            
            if (key === 'Escape' || key === 'Enter') {
                this.exitCallback(key === 'Enter') && key === 'Enter' && (this.textController as ElementController).setText(
                    (this.input as Input).getValue()
                );
            }
        }, this);

        this.addChild(this.input);
    }

    enterEditMode() {
        this.textController?.addClass('hidden');
        this.input?.removeClass('hidden');
    }

    exitEditMode() {
        this.textController?.removeClass('hidden');
        this.input?.addClass('hidden');
    }
}