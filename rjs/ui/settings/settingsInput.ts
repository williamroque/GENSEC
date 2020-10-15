import { clipboard } from 'electron';

import ElementController from '../elementController';
import Settings from "./settings";
import InputValue from '../inputValue';

export interface EntryContent {
    title: string,
    type: string,
    setting: string,
    [propName: string]: string
}

type SettingCallback = (section: string, entry: string, setting: any) => void;

export default class SettingsInput extends ElementController {
    private readonly title: string;
    private readonly type: string;
    private readonly section: string;
    private readonly entry: string;
    private readonly updateSettingCallback: SettingCallback;
    private readonly value: InputValue;

    constructor(entryContent: EntryContent, updateSettingCallback: SettingCallback, settingsInstance: Settings) {
        super(
            'DIV', {
                classList: new Set([
                    entryContent.type === 'checkbox' ? 'settings-input-checkbox' : 'settings-input'
                ])
            }
        )

        this.title = entryContent.title;
        this.type = entryContent.type;
        this.section = entryContent.section;
        this.entry = entryContent.entry;

        this.updateSettingCallback = updateSettingCallback;

        this.value = new InputValue(
            entryContent.setting,
            entryContent.type,
            null,
            settingsInstance
        );

        this.seedTree();

        this.setFieldValue(entryContent.setting);
    }

    seedTree() {
        if (this.type === 'checkbox') {
            const labelController = new ElementController(
                'LABEL', {
                    text: this.title,
                    classList: new Set(['settings-checkbox-label'])
                }
            );
            this.addChild(labelController, 'label');

            const inputController = new ElementController(
                'DIV', {
                    classList: new Set(['settings-checkbox', 'icon'])
                }
            );
            this.addChild(inputController, 'input');

            this.addEventListener('click', function(this: SettingsInput) {
                this.setFieldValue(!this.value.content);
            }, this);
        } else {
            const labelController = new ElementController(
                'LABEL', {
                    text: this.title,
                    classList: new Set(['settings-text-label'])
                }
            );
            this.addChild(labelController, 'label');

            const inputController = new ElementController(
                'INPUT', {
                    classList: new Set(['settings-text-input'])
                }
            );
            (inputController.element as HTMLElement).setAttribute('spellcheck', 'false');
            inputController.addEventListener('keydown', this.handleKeyEvent, this);
            this.addChild(inputController, 'input');
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

            if (this.type === 'password') {
                target.setSelectionRange(target.value.length, target.value.length);
            } else {
                target.setSelectionRange(selStart + 1, selStart + 1);
            }
        }

        const isValid = this.value.test();
        if (isValid) {
            this.updateSettingCallback(this.section, this.entry, this.value.content);
        }
        this.setValidityClass(isValid);

        return targetValue;
    }

    setFieldValue(value: string | boolean, range?: [number, number]) {
        const target = this.query('input') as ElementController;
        const targetElement = target.element as HTMLInputElement;

        let targetValue;

        if (this.type === 'checkbox') {
            targetValue = value;
            target.setText(value ? 'check_circle' : 'check_circle_outline');

            this.updateSettingCallback(this.section, this.entry, value);
        } else {
            value = value as string;
            if (typeof range === 'undefined') range = [0, value.length];

            if (this.type === 'password') {
                if (value === '') {
                    targetValue = this.value.content.split('');

                    targetValue.splice(range[0], range[1] - range[0], '');
                    targetValue = targetValue.join('');

                    targetElement.value = '•'.repeat(targetValue.length);
                } else {
                    targetValue = range[1] - range[0] === value.length ? value : this.value.content + value;
                    targetElement.value += '•'.repeat(value.length);
                }
            } else {
                targetValue = targetElement.value.split('');

                targetValue.splice(range[0], range[1] - range[0], value);
                targetValue = targetValue.join('');

                targetElement.value = targetValue;
            }
        }

        this.value.update(targetValue);

        if (this.type !== 'checkbox') {
            this.updateStyling();
        }

        return targetValue;
    }

    updateStyling() {
        const inputNode = this.query('input') as ElementController;
        const labelNode = this.query('label') as ElementController;

        const inputClass = 'settings-text-input-active';
        const labelClass = 'settings-text-label-active';

        if (this.value.content !== '') {
            inputNode.addClass(inputClass);
            labelNode.addClass(labelClass);
        } else {
            inputNode.removeClass(inputClass);
            labelNode.removeClass(labelClass);
        }
    }

    setValidityClass(isValid: boolean) {
        const inputNode = this.query('input') as ElementController;
        const labelNode = this.query('label') as ElementController;

        const inputClass = 'settings-input-invalid';
        const labelClass = 'settings-input-label-invalid';

        if (!isValid) {
            inputNode.addClass(inputClass);
            labelNode.addClass(labelClass);
        } else {
            inputNode.removeClass(inputClass);
            labelNode.removeClass(labelClass);
        }
    }

    handleKeyEvent(e: Event) {
        const event = e as KeyboardEvent;

        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey || event.key === 'Backspace') {
            this.updateField(event.key)

            event.preventDefault();
        } else {
            const target = this.query('input')?.element as HTMLInputElement;

            const selStart = target.selectionStart as number;
            const selEnd = target.selectionEnd as number;

            if ((event.metaKey || event.ctrlKey) && event.key === 'v') {
                const text = clipboard.readText();

                this.setFieldValue(text, [selStart, selEnd])
                target.setSelectionRange(selStart + text.length, selStart + text.length);
            } else if ((event.metaKey || event.ctrlKey) && event.key === 'x') {
                clipboard.writeText(target.value.slice(selStart, selEnd));

                this.updateField('');
            }
        }
    }
}