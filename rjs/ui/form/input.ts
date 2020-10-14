import { clipboard } from 'electron';

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

        this.seedTree();

        this.value = new InputValue('', this.type, this.setValidityClassCallback.bind(this), settingsInstance);
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
        inputController.addEventListener('keydown', this.handleKeyEvent, this);
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

    updateField(key: string) {
        const target = this.query('input')?.element as HTMLInputElement;

        const selStart = target.selectionStart as number;
        const selEnd = target.selectionEnd as number;

        const selLength = selEnd - selStart;

        let targetValue;

        if (key === 'Backspace') {
            let cursorOffset = 0;

            if (selLength > 0) {
                targetValue = this.setFieldValue('', [selStart, selEnd]);
            } else {
                targetValue = this.setFieldValue('', [selStart - 1, selEnd]);
                cursorOffset = 1;
            }

            target.setSelectionRange(selStart - cursorOffset, selStart - cursorOffset);
        } else {
            targetValue = this.setFieldValue(key, [selStart, selEnd]);
            target.setSelectionRange(selStart + 1, selStart + 1);
        }

        if (this.type === 'anualIncrement' || this.type === 'monthlyIncrement') {
            if (this.value.test()) {
                this.setAnchorCallback?.(
                    this.incrementGroup,
                    targetValue,
                    this.type
                );
            }
        }

        return targetValue;
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

    handleKeyEvent(e: Event) {
        const event = e as KeyboardEvent;

        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey || event.key === 'Backspace') {
            this.updateField(event.key)

            event.preventDefault();
        } else {
            if ((event.metaKey || event.ctrlKey) && event.key === 'v') {
                const target = this.query('input')?.element as HTMLInputElement;

                const selStart = target.selectionStart as number;
                const selEnd = target.selectionEnd as number;

                const text = clipboard.readText();

                this.setFieldValue(text, [selStart, selEnd])
                target.setSelectionRange(selStart + text.length, selStart + text.length);
            } else if ((event.metaKey || event.ctrlKey) && event.key === 'x') {
                const target = this.query('input')?.element as HTMLInputElement;

                const selStart = target.selectionStart as number;
                const selEnd = target.selectionEnd as number;

                clipboard.writeText(target.value.slice(selStart, selEnd));

                this.updateField('');
            }
        }
    }
}