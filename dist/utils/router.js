// utils/router.ts
import { patch } from "./vdom.js";
export class Router {
    constructor(routes, appContainer) {
        this.currentVNode = {
            tag: 'div',
            props: {},
            children: []
        };
        this.activeComponent = null;
        this.routes = routes;
        this.appContainer = appContainer;
        this.init();
    }
    init() {
        window.addEventListener("popstate", () => this.route());
        // Use setTimeout to ensure DOM is fully loaded
        setTimeout(() => this.route(), 0);
    }
    route() {
        const path = window.location.pathname;
        const route = this.routes.find((r) => r.path === path) || this.routes.find((r) => r.path === '/');
        if (route) {
            // Create a callback that the component can use to signal updates
            const onDataUpdated = () => {
                if (this.activeComponent) {
                    const newVNode = this.activeComponent.render();
                    patch(this.appContainer, newVNode, this.currentVNode);
                    this.currentVNode = newVNode;
                }
            };
            // Clear container before first render if empty
            if (!this.currentVNode.children || this.currentVNode.children.length === 0) {
                this.appContainer.innerHTML = '';
            }
            // Store the active component
            this.activeComponent = new route.component(onDataUpdated);
            const newVNode = this.activeComponent.render();
            patch(this.appContainer, newVNode, this.currentVNode);
            this.currentVNode = newVNode;
        }
        else {
            this.activeComponent = null;
            const newVNode = {
                tag: "h1",
                props: {},
                children: ["404 - Page Not Found"]
            };
            patch(this.appContainer, newVNode, this.currentVNode);
            this.currentVNode = newVNode;
        }
    }
    navigate(path) {
        if (window.location.pathname !== path) {
            window.history.pushState({}, "", path);
            this.route();
        }
    }
}
