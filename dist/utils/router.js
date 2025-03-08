import { patch } from "../utils/vdom.js";
export class Router {
    constructor(routes, appContainer) {
        this.currentVNode = "";
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
            const onDataUpdated = () => {
                const component = new route.component(onDataUpdated);
                const newVNode = component.render();
                patch(this.appContainer, newVNode, this.currentVNode);
                this.currentVNode = newVNode;
            };
            this.appContainer.innerHTML = "";
            onDataUpdated();
        }
        else {
            const newVNode = {
                tag: "h1",
                props: {},
                children: ["404 - Page Not Found"],
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
