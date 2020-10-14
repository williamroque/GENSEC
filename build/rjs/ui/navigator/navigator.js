"use strict";
const ElementController = require('../elementController');
class Navigator extends ElementController {
    constructor(filesystem, container, activateCallback) {
        super('DIV', {
            classList: new Set(['navigator'])
        });
        this.container = container;
        this.system = filesystem;
        this.currentDirectory = this.system;
        this.path = [];
        this.activateCallback = activateCallback;
        this.seedTree();
    }
    seedTree() {
        if (this.path.length > 0) {
            const parentFile = new ElementController('DIV', {
                text: '..',
                classList: new Set(['navigator-file'])
            });
            parentFile.addEventListener('click', function (e) {
                this.path.pop();
                this.currentDirectory = this.system;
                this.path.forEach(item => {
                    this.currentDirectory = this.currentDirectory.files[item];
                });
                this.clearChildren();
                this.seedTree();
                this.activate();
            }, this);
            this.addChild(parentFile);
        }
        Object.entries(this.currentDirectory.files).forEach(([fileName, content]) => {
            const file = new ElementController('DIV', {
                text: content.type === 'directory' ? fileName : content.manifest.title,
                classList: new Set(['navigator-file'])
            });
            file.addEventListener('click', function (e) {
                if (content.type === 'directory') {
                    this.path.push(fileName);
                    this.currentDirectory = content;
                    this.clearChildren();
                    this.seedTree();
                    this.activate();
                }
                else {
                    this.activateCallback(content.manifest);
                }
            }, this);
            this.addChild(file);
        });
    }
    clearContainer() {
        let child;
        while (child = this.container.firstChild) {
            this.container.removeChild(child);
        }
    }
    clearChildren() {
        Object.keys(this.DOMTree.children).forEach(childID => {
            this.removeChild(childID);
        });
    }
    activate() {
        this.clearContainer();
        this.container.appendChild(this.element);
    }
}
module.exports = Navigator;
