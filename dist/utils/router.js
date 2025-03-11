import { patch } from "./vdom.js";
export class Router {
    get currentPath() {
        return window.location.pathname;
    }
    constructor(routes, appContainer) {
        this.currentVNode = {
            tag: 'div',
            props: {},
            children: []
        };
        this.activeComponent = null;
        this.isNavigating = false;
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
        // Prevent multiple simultaneous navigations
        if (this.isNavigating) {
            return;
        }
        this.isNavigating = true;
        const path = window.location.pathname;
        let route = this.routes.find((r) => r.path === path);
        if (!route) {
            const wildcardRoute = this.routes.find((r) => r.path === "/*");
            if (wildcardRoute) {
                route = wildcardRoute;
            }
        }
        this.updateNavigationVisibility();
        if (route) {
            // Create a callback that the component can use to signal updates
            const onDataUpdated = () => {
                if (this.activeComponent) {
                    const newVNode = this.activeComponent.render();
                    patch(this.appContainer, newVNode, this.currentVNode);
                    this.currentVNode = newVNode;
                }
            };
            // Clear the container completely before mounting a new component
            this.appContainer.innerHTML = '';
            // Reset current VNode to empty div
            this.currentVNode = {
                tag: 'div',
                props: {},
                children: []
            };
            // Store the active component
            this.activeComponent = new route.component(onDataUpdated);
            const newVNode = this.activeComponent.render();
            patch(this.appContainer, newVNode, this.currentVNode);
            this.currentVNode = newVNode;
        }
        else {
            this.activeComponent = null;
            this.appContainer.innerHTML = '';
            const newVNode = {
                tag: "h1",
                props: {},
                children: ["404 - Page Not Found"]
            };
            patch(this.appContainer, newVNode, this.currentVNode);
            this.currentVNode = newVNode;
        }
        this.isNavigating = false;
    }
    updateNavigationVisibility() {
        const navElement = document.querySelector('ul');
        if (navElement) {
            if (this.currentPath === '/login' ||
                (!this.routes.some(r => r.path === this.currentPath) && this.currentPath !== '/')) {
                navElement.style.display = 'none';
            }
            else {
                navElement.style.display = 'block';
            }
        }
    }
    navigate(path) {
        if (window.location.pathname !== path) {
            window.history.pushState({}, "", path);
            this.route();
        }
    }
}
