const settingsOptionButton = document.querySelector('#settings');
const sidebarElement = document.querySelector('#sidebar');

settingsOptionButton.addEventListener('click', () => {
    sidebarElement.classList.toggle('sidebar-full');
}, false);
