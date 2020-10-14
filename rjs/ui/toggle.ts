import ElementController from './elementController';

const togglePrompt = document.querySelector('#toggle-prompt') as HTMLDivElement;

export default class Toggle {
    static clearPrompt() {
        let child;
        while (child = togglePrompt.firstChild) {
            togglePrompt.removeChild(child);
        }
    }

    static show(buttons: [ElementController], x: number, y: number) {
        Toggle.clearPrompt();

        for (const button of buttons) {
            button.addEventListener('click', function() {
                Toggle.hide();
            }, null);

            togglePrompt.appendChild(button.element as HTMLButtonElement);
        }

        togglePrompt.classList.remove('hidden');

        if (x + togglePrompt.offsetWidth > window.innerWidth) {
            x -= togglePrompt.offsetWidth;
        }

        if (y + togglePrompt.offsetHeight > window.innerHeight) {
            y -= togglePrompt.offsetHeight;
        }

        togglePrompt.style.left = `${x}px`;
        togglePrompt.style.top = `${y}px`;

    }

    static hide() {
        togglePrompt.classList.add('hidden');
    }
}

window.addEventListener('click', () => Toggle.hide(), false);
window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        Toggle.hide();
    }
}, false);
togglePrompt.addEventListener('click', e => e.stopPropagation(), false);
