export class Router {
    constructor(routes, appContainer) {
        this.routes = routes;
        this.appContainer = appContainer;
        this.init();
    }
    init() {
        window.addEventListener("popstate", () => this.route());
        document.addEventListener("DOMContentLoaded", () => this.route());
    }
    route() {
        const path = window.location.pathname;
        const route = this.routes.find((r) => r.path === path);
        if (route) {
            const component = new route.component();
            this.appContainer.innerHTML = component.render();
        }
        else {
            this.appContainer.innerHTML = "<h1>404 - Page Not Found</h1>";
        }
    }
    navigate(path) {
        window.history.pushState({}, "", path);
        this.route();
    }
}
