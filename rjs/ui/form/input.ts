import ElementController from '../elementController';
import InputValue from '../inputValue';
import Settings from '../settings/settings';
import ValuesContainer from './valuesContainer';

export interface InputProperties {
    id: string,
    label: string,
    group: string,
    type: string,
    disabled: boolean,
    width: number,
    incrementGroup: string,
    drawDefault?: string,
    initialOffset?: number
}

type AnchorCallback = (group: string, date: string, type: string) => void;

export default class Input extends ElementController {
    private readonly valuesContainer: ValuesContainer;
    private readonly id: string;
    private readonly label: string;
    private readonly group: string;
    private readonly disabled: boolean;
    private readonly incrementGroup: string;
    private readonly value: InputValue;
    private readonly listID?: string;

    private setAnchorCallback?: AnchorCallback;
    private getIndex?: () => number;

    readonly type: string;

    constructor(valuesContainer: ValuesContainer, properties: InputProperties, settingsInstance: Settings, listID?: string, setAnchorCallback?: AnchorCallback, getIndex?: () => number) {
        super(
            'DIV', {
                width: properties.width,
                classList: new Set(['form-cell'])
            }
        );

        this.valuesContainer = valuesContainer;

        this.id = properties.id;
        this.label = properties.label;
        this.group = properties.group;
        this.type = properties.type;
        this.incrementGroup = properties.incrementGroup;
        this.disabled = properties.disabled;

        this.listID = listID;

        this.setAnchorCallback = setAnchorCallback;

        this.getIndex = getIndex;

        this.value = new InputValue('', this.type, this.setValidityClassCallback.bind(this), settingsInstance);

        this.seedTree();
    }

    seedTree() {
        const labelController = new ElementController(
            'LABEL', {
                text: this.label,
                classList: new Set(['form-input-label'])
            }
        );
        if (this.disabled) {
            labelController.element?.setAttribute('disabled', 'disabled');
        }
        this.addChild(labelController, 'label');

        const inputController = new ElementController(
            'INPUT', {
                classList: new Set(['form-input'])
            }
        );
        if (this.disabled) {
            inputController.element?.setAttribute('disabled', 'disabled');
        }
        inputController.addEventListener('keyup', this.handleKeyEvent, this);
        this.addChild(inputController, 'input');

        if (this.type === 'percentage' || this.type === 'percentageOptional') {
            const percentageLabelController = new ElementController(
                'LABEL', {
                    text: '%',
                    classList: new Set(['percentage-symbol'])
                }
            );
            if (this.disabled) {
                percentageLabelController.element?.setAttribute('disabled', 'disabled');
            }
            this.addChild(percentageLabelController, 'percentageSymbol');
            inputController.addClass('percentage-input');
        }

        this.updateFormValue('');
    }

    setValidityClassCallback(isValid: boolean) {
        const inputNode = this.query('input') as ElementController;
        const labelNode = this.query('label') as ElementController;
        const percentageLabelNode = this.query('percentageSymbol');

        if (!isValid) {
            inputNode.addClass('form-input-invalid');
            labelNode.addClass('form-input-label-invalid');
            percentageLabelNode?.addClass('percentage-symbol-invalid');
        } else {
            inputNode.removeClass('form-input-invalid');
            labelNode.removeClass('form-input-label-invalid');
            percentageLabelNode?.removeClass('percentage-symbol-invalid');
        }
    }

    setFieldValue(value: string, range=[0, value.length]) {
        const target = this.query('input')?.element as HTMLInputElement;

        let targetValue = target.value.split('');
        targetValue.splice(range[0], range[1] - range[0], value);
        let valueString = targetValue.join('');

        target.value = valueString;
        this.updateFormValue(valueString);
        return valueString;
    }

    updateFormValue(value: string) {
        this.value.update(value);

        if (typeof this.listID !== 'undefined' && typeof this.getIndex !== 'undefined') {
            this.valuesContainer.update(this.value, this.listID, this.group, this.getIndex());
        } else {
            this.valuesContainer.update(this.value, this.id, this.group);
        }

        this.updateStyling();
    }

    updateStyling() {
        const inputNode = this.query('input') as ElementController;
        const labelNode = this.query('label') as ElementController;
        const percentageLabelNode = this.query('percentageSymbol');

        if (this.value.content !== '') {
            inputNode.addClass('form-input-active');
            labelNode.addClass('form-input-label-active');
            percentageLabelNode?.addClass('percentage-symbol-active');
        } else {
            inputNode.removeClass('form-input-active');
            labelNode.removeClass('form-input-label-active');
            percentageLabelNode?.removeClass('percentage-symbol-active');
        }
    }

    handleKeyEvent() {
        const target = this.query('input')?.element as HTMLInputElement;
        this.updateFormValue(target.value);

        if (this.type === 'anualIncrement' || this.type === 'monthlyIncrement') {
            if (this.value.test()) {
                this.setAnchorCallback?.(
                    this.incrementGroup,
                    target.value,
                    this.type
                );
            }
        }
    }
}