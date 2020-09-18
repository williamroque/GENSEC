const settingsOptionButton = document.querySelector('#settings');
const sidebarElement = document.querySelector('#sidebar');

const saveSettingsButton = document.querySelector('#save-settings');
const settingsInputs = document.querySelectorAll('.settings-row');

function updateInputClass(input, label) {
    if (input.value !== '') {
        input.classList.add('settings-input-active');
        label.classList.add('settings-label-active');
    } else {
        input.classList.remove('settings-input-active');
        label.classList.remove('settings-label-active');
    }
}

settingsInputs.forEach(elem => {
    const input = elem.querySelector('.settings-input');
    const label = elem.querySelector('.settings-label');

    input.addEventListener('change', () => {
        updateInputClass(input, label);
    }, false);
});

settingsOptionButton.addEventListener('click', () => {
    sidebarElement.classList.toggle('sidebar-full');

    const settings = requestReadSettings();
    settingsInputs.forEach(elem => {
        const input = elem.querySelector('.settings-input');
        const label = elem.querySelector('.settings-label');

        const settingName = label.textContent.toLowerCase();
        if (settings[settingName]) input.value = settings[settingName];

        updateInputClass(input, label);
    });
}, false);

saveSettingsButton.addEventListener('click', () => {
    let settings = {};
    for (let i = 0; i < settingsInputs.length; i++) {
        const input = settingsInputs[i].querySelector('.settings-input');
        const label = settingsInputs[i].querySelector('.settings-label');

        const settingName = label.textContent;

        const pattern = new RegExp(input.getAttribute('data-pattern'));
        const val = input.value;

        if (pattern.test(val)) {
            settings[settingName.toLowerCase()] = input.value;
        } else {
            showMessagePrompt(`Invalid input for <i>${label.textContent}</i>.`, 2000);
            return;
        }
    }

    if (requestWriteSettings(settings) === 1) {
        showMessagePrompt('Unable to write settings.', 2000);
    } else {
        showMessagePrompt('Successfully wrote settings.', 1500);
        if (isConnected) {
            reconnect();
        }
    }
});
