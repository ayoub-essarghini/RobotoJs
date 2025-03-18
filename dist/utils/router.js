import { createApp, h } from '../core/roboto.js';
export class Router {
    get currentPath() {
        return window.location.pathname;
    }
    constructor(routes, appContainer) {
        this.currentInstance = null;
        this.isNavigating = false;
        this.routes = routes;
        this.appContainer = appContainer;
        this.init();
    }
    init() {
        window.addEventListener("popstate", () => this.route());
        setTimeout(() => this.route(), 0); // Ensure DOM is loaded
    }
    route() {
        if (this.isNavigating) {
            return;
        }
        this.isNavigating = true;
        const path = this.currentPath;
        let route = this.routes.find((r) => r.path === path);
        if (!route) {
            const wildcardRoute = this.routes.find((r) => r.path === "/*");
            if (wildcardRoute) {
                route = wildcardRoute;
            }
        }
        this.updateNavigationVisibility();
        if (route) {
            // Unmount previous instance if it exists
            if (this.currentInstance) {
                this.currentInstance.unmount();
                this.appContainer.innerHTML = ''; // Clear the container
            }
            // Create a wrapper component that calls the route's component
            const RouteComponent = () => route.component();
            // Mount the new component
            const app = createApp(RouteComponent);
            this.currentInstance = app.mount(this.appContainer);
        }
        else {
            // Handle 404 case
            if (this.currentInstance) {
                this.currentInstance.unmount();
                this.appContainer.innerHTML = '';
            }
            const NotFoundComponent = () => h("h1", null, "404 - Page Not Found");
            const app = createApp(NotFoundComponent);
            this.currentInstance = app.mount(this.appContainer);
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
