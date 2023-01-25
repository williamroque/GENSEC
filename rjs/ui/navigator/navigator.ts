import ElementController from '../elementController';

import { System, SystemFiles } from "../../../mjs/filesystem/filesystem";
import Manifest from "../../../mjs/filesystem/manifest";

export default class Navigator extends ElementController {
    private readonly container: HTMLDivElement;
    private readonly system: System;
    private readonly activateCallback: (manifest: Manifest) => void;

    private currentDirectory: System;
    private path: string[];

    constructor(filesystem: System, container: HTMLDivElement, activateCallback: (manifest: Manifest) => void) {
        super(
            'DIV', {
                classList: new Set(['navigator'])
            }
        );
        this.container = container;

        this.system = filesystem;
        this.currentDirectory = this.system;

        this.path = [];

        this.activateCallback = activateCallback;

        this.seedTree();
    }

    seedTree() {
        if (this.path.length > 0) {
            const parentFile = new ElementController(
                'DIV', {
                    text: '..',
                    classList: new Set(['navigator-file'])
                }
            );
            parentFile.addEventListener('click', function (this: Navigator) {
                this.path.pop();
                this.currentDirectory = this.system;
                this.path.forEach((item: string) => {
                    this.currentDirectory = (this.currentDirectory.files as SystemFiles)[item];
                });

                this.clearChildren();
                this.seedTree();
                this.activate();
            }, this);
            this.addChild(parentFile);
        }

        Object.entries(this.currentDirectory.files as SystemFiles).forEach(([fileName, content]) => {
            const file = new ElementController(
                'DIV', {
                    text: content.type === 'directory' ? fileName : (content.manifest as Manifest).title,
                    classList: new Set(['navigator-file'])
                }
            );
            file.addEventListener('click', function(this: Navigator) {
                if (content.type === 'directory') {
                    this.path.push(fileName);

                    this.currentDirectory = content;

                    this.clearChildren();
                    this.seedTree();
                    this.activate();
                } else {
                    this.activateCallback(content.manifest as Manifest);
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
        this.container.appendChild(this.element as HTMLDivElement);
    }
}
