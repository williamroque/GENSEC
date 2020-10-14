import ElementController from '../elementController';
import ListRow, { SchemataType } from './listRow';
import Toggle from '../toggle';
import ValuesContainer from './valuesContainer';
import Input from './input';
import Settings from '../settings/settings';

export interface ListProperties {
    id: string,
    label: string,
    inputs: SchemataType,
    max?: number,
    min?: number
}

export default class List extends ElementController {
    private readonly valuesContainer: ValuesContainer;
    private readonly id: string;
    private readonly label: string;
    private readonly inputs: SchemataType;
    private readonly max: number;
    private readonly min: number;
    private readonly settingsInstance: Settings;
    private readonly syncedLists?: Array<List>;
    private readonly fileData?: object;

    private showStateComplementLabel: string;
    private listRows: Array<ListRow>;
    private incrementAnchors: object;

    listController?: ElementController;
    moreContainerController?: ElementController;
    buttonController?: ElementController;

    constructor(valuesContainer: ValuesContainer, properties: ListProperties, settingsInstance: Settings, syncedLists?: Array<List>, fileData?: { [propName: string]: string }) {
        super(
            'DIV', {
                classList: new Set(['list-container'])
            }
        );

        this.valuesContainer = valuesContainer;

        this.id = properties.id;
        this.label = properties.label;
        this.inputs = properties.inputs;
        this.max = properties.max || Infinity;
        this.min = properties.min || 0;

        this.settingsInstance = settingsInstance;

        this.syncedLists = syncedLists || [this];

        this.fileData = fileData;

        this.showStateComplementLabel = 'Esconder';

        this.addEventListener('contextmenu', function(this: List, e: Event) {
            const event = e as MouseEvent;

            const button = new ElementController(
                'BUTTON', {
                    classList: new Set(['toggle-button']),
                    'text': this.showStateComplementLabel
                }
            )

            button.addEventListener('click', function(this: List) {
                this.toggleListItemsVisibility();
            }, this);

            Toggle.show([button], event.pageX, event.pageY);
        }, this);

        this.listRows = [];
        this.incrementAnchors = {};

        this.seedTree();
    }

    calibrateIndices() {
        this.syncedLists?.forEach(syncedList => {
            syncedList.incrementAnchors = this.incrementAnchors;
            syncedList.listRows.forEach((listRow, i) => {
                listRow.index = i;
            });
        });
    }

    deleteCallback(i: number, id: string) {
        if (this.listRows.length > this.min) {
            this.syncedLists?.forEach(syncedList => {
                const listRow = syncedList.query('list-items-container')?.query(id) as ListRow;
                syncedList.listController?.removeChild(id);
                syncedList.listRows.splice(i, 1);
                syncedList.calibrateIndices();

                listRow.delete.call(listRow);
            });
            this.calibrateIndices();
        }
    }

    seedTree() {
        this.listController = new ElementController(
            'DIV', {
                classList: new Set(['list-items-container'])
            }
        );
        this.addChild(this.listController, 'list-items-container');

        this.moreContainerController = new ElementController(
            'DIV', {
                classList: new Set(['more-container', 'hidden'])
            }
        );
        const moreController = new ElementController(
            'SPAN', {
                classList: new Set(['more']),
                text: '...'
            }
        );
        this.moreContainerController.addChild(moreController);
        this.moreContainerController.addEventListener('click', function(this: List) {
            this.toggleListItemsVisibility();
        }, this);
        this.addChild(this.moreContainerController);

        this.buttonController = new ElementController(
            'BUTTON', {
                text: this.label,
                classList: new Set(['form-button'])
            }
        );
        this.buttonController.addEventListener('click', function(this: List) {
            this.addRow();
        }, this);
        this.addChild(this.buttonController);

        while (this.listRows.length < this.min) {
            this.addRow();
        }
    }

    addRow(values?: [string] | [number]) {
        if (Object.values(this.listController?.getChildren() as { [propName: string]: ElementController }).length < this.max) {
            const listRow = new ListRow(this.valuesContainer, this.deleteCallback.bind(this), this.id, this.inputs, this.listRows.length, this.settingsInstance, this.incrementAnchors, this.calibrateIndices.bind(this), this.fileData);
            this.listController?.addChild(listRow);

            if (typeof values !== 'undefined') {
                listRow.setFormValues(values);
            }

            this.listRows.push(listRow);

            this.calibrateIndices();
        }
    }

    toggleListItemsVisibility() {
        if (this.showStateComplementLabel === 'Esconder') {
            this.listController?.addClass('hidden');
            this.moreContainerController?.removeClass('hidden');

            this.showStateComplementLabel = 'Mostrar';
        } else {
            this.listController?.removeClass('hidden');
            this.moreContainerController?.addClass('hidden');

            this.showStateComplementLabel = 'Esconder';
        }
    }

    remove() {
        super.remove();
        this.valuesContainer.removeFromAll(this.id);
    }
}