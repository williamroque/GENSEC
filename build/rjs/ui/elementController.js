"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ElementController {
    constructor(type, properties) {
        this.dataProperties = {};
        this.DOMTree = Object.assign(Object.assign({ type: type }, properties), { children: {} });
        this.childID = 0;
        this.rendersText = true;
        this.render();
    }
    addClass(nodeClass) {
        if ('classList' in this.DOMTree) {
            this.DOMTree.classList.add(nodeClass);
        }
        else {
            this.DOMTree.classList = new Set([nodeClass]);
        }
        this.render();
    }
    removeClass(nodeClass) {
        if ('classList' in this.DOMTree) {
            this.DOMTree.classList.delete(nodeClass);
            this.render();
        }
    }
    getChildren() {
        return this.DOMTree.children;
    }
    addChild(node, id, prepend = false) {
        if (typeof id === "undefined") {
            id = `unique-${this.childID++}`;
        }
        node.nodeID = id;
        node.prepend = prepend;
        this.DOMTree.children[id] = node;
        this.render();
        return id;
    }
    removeChild(id) {
        this.DOMTree.children[id].remove();
        delete this.DOMTree.children[id];
    }
    getIndex() {
        let child = this.element;
        let nodeIndex = 0;
        while ((child = child.previousSibling) !== null) {
            nodeIndex++;
        }
        return nodeIndex;
    }
    setText(text) {
        this.DOMTree.text = text;
        this.render();
    }
    toggleText() {
        this.rendersText = !this.rendersText;
        this.render();
    }
    query(id) {
        if (id in this.DOMTree.children) {
            return this.DOMTree.children[id];
        }
        const target = Object.values(this.DOMTree.children).find(child => child.query(id));
        return target ? target.query(id) : undefined;
    }
    addEventListener(event, callback, context) {
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener(event, callback.bind(context), false);
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
            this.element.innerText = this.DOMTree.text;
        }
        else {
            this.element.innerText = '';
        }
        if ('classList' in this.DOMTree) {
            this.element.className = '';
            for (const nodeClass of this.DOMTree.classList) {
                this.element.classList.add(nodeClass);
            }
        }
        for (const childNode of Object.values(this.DOMTree.children)) {
            childNode.render();
            if (typeof childNode.prepend !== 'undefined' && childNode.prepend) {
                this.element.prepend(childNode.element);
            }
            else {
                this.element.appendChild(childNode.element);
            }
        }
    }
    remove() {
        var _a;
        this.nodeID = undefined;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.remove();
    }
}
exports.default = ElementController;
