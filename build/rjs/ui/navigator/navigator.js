"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elementController_1 = __importDefault(require("../elementController"));
class Navigator extends elementController_1.default {
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
            const parentFile = new elementController_1.default('DIV', {
                text: '..',
                classList: new Set(['navigator-file'])
            });
            parentFile.addEventListener('click', function () {
                this.path.pop();
                this.currentDirectory = this.system;
                this.path.forEach((item) => {
                    this.currentDirectory = this.currentDirectory.files[item];
                });
                this.clearChildren();
                this.seedTree();
                this.activate();
            }, this);
            this.addChild(parentFile);
        }
        Object.entries(this.currentDirectory.files).forEach(([fileName, content]) => {
            const file = new elementController_1.default('DIV', {
                text: content.type === 'directory' ? fileName : content.manifest.title,
                classList: new Set(['navigator-file'])
            });
            file.addEventListener('click', function () {
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
    activate() {
        this.clearContainer();
        this.container.appendChild(this.element);
    }
}
exports.default = Navigator;
