export interface Properties {
    classList?: Set<string>;
    text?: string;
    width?: number;
}

export default class ElementController {
    private DOMTree: Properties & { type: string, children: { [propName: string]: ElementController } };
    private childID: number;
    private rendersText: boolean;
    
    nodeID?: string;
    element?: HTMLElement;
    prepend?: boolean;

    dataProperties?: {[propName: string]: any};

    constructor(type: string, properties: Properties) {
        this.DOMTree = {
            type: type,
            ...properties,
            children: {}
        };
        this.childID = 0;

        this.rendersText = true;

        this.render();
    }

    addClass(nodeClass: string) {
        if ('classList' in this.DOMTree) {
            (this.DOMTree.classList as Set<string>).add(nodeClass);
        } else {
            this.DOMTree.classList = new Set([nodeClass]);
        }
        this.render();
    }

    removeClass(nodeClass: string) {
        if ('classList' in this.DOMTree) {
            (this.DOMTree.classList as Set<string>).delete(nodeClass);
            this.render();
        }
    }

    getChildren() {
        return this.DOMTree.children;
    }

    addChild<T extends ElementController>(node: T, id?: string, prepend=false) {
        if (typeof id === "undefined") {
            id = `unique-${this.childID++}`;
        }
        node.nodeID = id;
        node.prepend = prepend;

        this.DOMTree.children[id] = node;

        this.render();

        return id;
    }

    removeChild(id: string) {
        this.DOMTree.children[id].remove();
        delete this.DOMTree.children[id];
    }

    getIndex() {
        let child: ChildNode | null = this.element as ChildNode;
        let nodeIndex = 0;

        while ((child = child.previousSibling) !== null) {
            nodeIndex++;
        }

        return nodeIndex;
    }

    setText(text: string) {
        this.DOMTree.text = text;
        this.render();
    }

    toggleText() {
        this.rendersText = !this.rendersText;
        this.render();
    }

    query(id: string): ElementController | undefined {
        if (id in this.DOMTree.children) {
            return this.DOMTree.children[id];
        }

        const target = Object.values(this.DOMTree.children).find(child => child.query(id));
        return target ? target.query(id) : undefined;
    }

    addEventListener(event: string, callback: (e: Event) => void, context: any) {
        this.element?.addEventListener(event, callback.bind(context), false);
    }

    clearChildren() {
        Object.keys(this.DOMTree.children).forEach(childID => {
            this.removeChild(childID);
        });
    }

    render() {
        if (!this.element) {
            this.element = document.createElement(this.DOMTree.type);
        }

        if ('width' in this.DOMTree) {
            this.element.style.width = `${this.DOMTree.width}%`;
        }

        if ('text' in this.DOMTree && this.rendersText) {
            this.element.innerText = this.DOMTree.text as string;
        } else {
            this.element.innerText = '';
        }

        if ('classList' in this.DOMTree) {
            this.element.className = '';
            for (const nodeClass of (this.DOMTree.classList as Set<string>)) {
                this.element.classList.add(nodeClass);
            }
        }

        for (const childNode of Object.values(this.DOMTree.children)) {
            childNode.render();

            if (typeof childNode.prepend !== 'undefined' && childNode.prepend) {
                this.element.prepend(childNode.element as HTMLElement);
            } else {
                this.element.appendChild(childNode.element as HTMLElement);
            }
        }
    }

    remove() {
        this.nodeID = undefined;
        this.element?.remove();
    }
}