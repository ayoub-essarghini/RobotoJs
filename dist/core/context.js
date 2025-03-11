// src/core/context.ts
import { patch } from "../utils/vdom.js";
export class DOMContext {
    constructor() {
        this.activeComponent = null;
        this.rootNode = null;
        this.currentVNode = null;
        this.pendingUpdates = new Set();
        this.isRenderScheduled = false;
    }
    static getInstance() {
        if (!DOMContext.instance) {
            DOMContext.instance = new DOMContext();
        }
        return DOMContext.instance;
    }
    setRoot(element) {
        this.rootNode = element;
    }
    mount(component) {
        if (!this.rootNode) {
            throw new Error("Root element is not set");
        }
        this.activeComponent = component;
        const vnode = component.render();
        this.currentVNode = vnode;
        patch(this.rootNode, vnode, { tag: "div", props: {}, children: [] });
    }
    enqueueUpdate(component) {
        if (this.pendingUpdates.size === 0 && !this.isRenderScheduled) {
            this.scheduleUpdate();
        }
        this.pendingUpdates.add(component);
    }
    scheduleUpdate() {
        this.isRenderScheduled = true;
        Promise.resolve().then(() => this.flushUpdates());
    }
    flushUpdates() {
        if (!this.rootNode || !this.currentVNode)
            return;
        this.pendingUpdates.forEach(component => {
            if (component === this.activeComponent) {
                const newVNode = component.render();
                patch(this.rootNode, newVNode, this.currentVNode);
                this.currentVNode = newVNode;
            }
        });
        this.pendingUpdates.clear();
        this.isRenderScheduled = false;
    }
}
DOMContext.instance = null;
