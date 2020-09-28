const InputValue = require('../inputValue');

class SettingsInput {
    constructor(entryContent, updateSettingCallback) {
        super(
            'DIV', {
                classList: new Set(['settings-input'])
            }
        )

        this.title = entryContent.title;
        this.type = entryContent.type;
        this.section = entryContent.section;
        this.entry = entryContent.entry;

        this.updateSettingCallback = updateSettingCallback;

        this.value = new InputValue(
            entryContent.setting,
            entryContent.type
        );

        this.seedTree();

        this.setFieldValue(entryContent.setting);
    }

    seedTree() {
        const labelController = new ElementController(
            'LABEL', {
                text: this.label,
                classList: new Set(['settings-input-label'])
            }
        );
        this.addChild(labelController, 'label');

        const inputController = new ElementController(
            'INPUT', {
                classList: new Set(['settings-input'])
            }
        );
        inputController.addEventListener('keydown', this.handleKeyEvent, this);
        this.addChild(inputController, 'input');
    }

    updateField(key) {
        const target = this.query('input').element;

        const selStart = target.selectionStart;
        const selEnd = target.selectionEnd;

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

        const isValid = this.value.test();
        if (isValid) {
            this.updateSettingCallback(this.section, this.entry, this.value.content);
        }
        this.setValidityClass(isValid);

        return targetValue;
    }

    setFieldValue(value, range=[0, value.length]) {
        const target = this.query('input').element;
        let targetValue = target.value.split('');

        targetValue.splice(range[0], range[1] - range[0], value);
        targetValue = targetValue.join('');

        target.value = targetValue;

        this.updateFormValue(targetValue);

        return targetValue;
    }

    updateStyling() {
        const inputNode = this.query('input');
        const labelNode = this.query('label');

        const inputClass = 'settings-input-active';
        const labelClass = 'settings-input-label-active';

        if (this.value.content !== '') {
            inputNode.addClass(inputClass);
            labelNode.addClass(labelClass);
        } else {
            inputNode.removeClass(inputClass);
            labelNode.removeClass(labelClass);
        }
    }

    setValidityClass(isValid) {
        const inputNode = this.query('input');
        const labelNode = this.query('label');

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

    handleKeyEvent(e) {
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey || e.key === 'Backspace') {
            this.updateField(e.key)

            e.preventDefault();
        } else {
            if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
                const target = this.query('input').element;

                const selStart = target.selectionStart;
                const selEnd = target.selectionEnd;

                const text = clipboard.readText();

                this.setFieldValue(text, [selStart, selEnd])
                target.setSelectionRange(selStart + text.length, selStart + text.length);
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'x') {
                const target = this.query('input').element;

                const selStart = target.selectionStart;
                const selEnd = target.selectionEnd;
                clipboard.writeText(target.value.slice(selStart, selEnd));

                this.updateField(false, '')
            }
        }
    }
}

module.exports = SettingsInput;
