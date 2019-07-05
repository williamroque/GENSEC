const filterOption = document.querySelector('#filter');

filterOption.addEventListener('click', () => {
    currentAction.classList.remove('option-selected');
    filterOption.classList.add('option-selected');

    currentAction = filterOption;
}, false);


