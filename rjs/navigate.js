function createList() {
    pathData.forEach(file => {
        const type = file.type;
        const name = file.name;
        const id = file.id;

        if (type !== 'form' && type !== 'directory') {
            console.log('Invalid JSON');
            process.exit();
        }

        const nameText = document.createTextNode(name);

        const listItem = document.createElement('LI');
        listItem.setAttribute('class', 'directory');
        listItem.setAttribute('id', id);
        listItem.appendChild(nameText);

        directoryList.appendChild(listItem);
    });

    directoryList.childNodes.forEach(node => {
        node.addEventListener('click', e => {
            if (virtualPath[virtualPath.length - 1] !== node.innerText) {
                virtualPath.push(node.innerText);

                const id = e.target.id;
                const fileObject = pathData.find(file => file.id === id);

                if (fileObject.type === 'directory') {
                    pathData = fileObject.content;
                    update(true);
                } else {
                    let formData = [];
                    if (fileObject.location === 'remote') {
                        formData = JSON.parse(fs.readFileSync('forms/' + fileObject.path));
                    } else {
                        formData = fileObject.form;
                    }

                    update(false);
                    if (currentAction === Actions.FILTER) {
                        renderFilterTable(fileObject, formData);
                    } else if (currentAction === Actions.MUTATE) {
                        renderForm(formData, fileObject.id);
                    }
                }
            }
        }, false);
    });
}

function update(removesContent) {
    if (removesContent) {
        clearNode(directoryList);
        createList();
        render(directoryList, contentWrapper);
    }

    clearNode(navigationBar);

   [''].concat(virtualPath).forEach(file => {
       const wrapperElem = document.createElement('SPAN');

       const directoryElem = document.createElement('SPAN');
       const directoryElemText = document.createTextNode(file);

       directoryElem.setAttribute('class', 'dir-label');

       // Change to span path on click
       wrapperElem.addEventListener('click', e => {
           let text = e.target.innerText;
           text = text.slice(0, text.length - 1 || 1);

           // Handle home directory
           if (text === '/') {
               virtualPath = [];
               pathData = indexData;
               update(true);
               return;
           }

           // Cut current path to clicked directory
           virtualPath = virtualPath.slice(0, virtualPath.indexOf(text));

           update(true);
       }, false);

       directoryElem.appendChild(directoryElemText);

       const slashElem = document.createElement('SPAN');
       slashElem.setAttribute('class', 'dir-slash');
       const slashText = document.createTextNode('/');
       slashElem.appendChild(slashText);

       wrapperElem.appendChild(directoryElem);
       wrapperElem.appendChild(slashElem);

       navigationBar.appendChild(wrapperElem);
   });
}

function updateToolbarOption(optionElement, optionAction) {
    const from = currentAction;
    const to = optionAction;

    if (currentAction !== optionAction) {
        if (currentActionElement) {
            currentActionElement.classList.remove('option-selected');
        }
        optionElement.classList.add('option-selected');

        let prevOpPos = optionPosition;
        optionPosition = optionElement.getBoundingClientRect().top;

        currentActionElement = optionElement;
        currentAction = optionAction;

        moveOptionSelector(from, to, prevOpPos);
    }
}
