import { patch, VNode } from "../utils/vdom.js";

export type Route = {
  path: string;
  component: { new (onDataUpdated: () => void): { render: () => VNode } };
};

export class Router {
  private routes: Route[];
  private appContainer: HTMLElement;
  private currentVNode: VNode | string = "";

  constructor(routes: Route[], appContainer: HTMLElement) {
    this.routes = routes;
    this.appContainer = appContainer;
    this.init();
  }

  private init(): void {
    window.addEventListener("popstate", () => this.route());
    document.addEventListener("DOMContentLoaded", () => this.route());
  }

  private route(): void {
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
    } else {
      const newVNode = {
        tag: "h1",
        props: {},
        children: ["404 - Page Not Found"],
      };
      patch(this.appContainer, newVNode, this.currentVNode);
      this.currentVNode = newVNode;
    }
  }

  public navigate(path: string): void {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
      this.route();
    }
  }
}
