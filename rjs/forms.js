const fs = require('fs');

const index = './forms/filesystem.json';

let indexData = fs.readFileSync(index);
indexData = JSON.parse(indexData).filesystem;

let virtualPath = '/';

let dom = {};

let directoryList = document.createElement('ul');

function createList() {
    const path = virtualPath.split('/');
    let pathData = indexData;

    for (let file of path) {
        pathData = file.content;
    }

    pathData.forEach(file => {
        const type = file.type;
        const name = file.name;
        const id = file.id;

        if (type !== 'form' && type !== 'directory') {
            console.log('Invalid JSON');
            process.exit();
        }

        dom[name] = document.createElement('li');
        directoryList.appendChild(dom[name]);
    });
}

function render(wrapper) {
    while (wrapper.firstChild) {
        wrapper.removeChild(wrapper.firstChild);
    }
    
    wrapper.appendChild(directoryList);
}

for (let key in dom) {
    dom[key].addEventListener('click', () => {
        virtualPath 
    }, false);
}
