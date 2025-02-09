import { render, VNode } from "../utils/vdom";

export type Route = {
  path: string;
  component: { new (onDataUpdated: () => void): { render: () => VNode } };
};

export class Router {
  private routes: Route[];
  private appContainer: HTMLElement;

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
        const vNode = component.render();
        this.appContainer.innerHTML = ''; // Clear the container
        this.appContainer.appendChild(render(vNode));
      };

      onDataUpdated(); // Initial render
    } else {
      this.appContainer.innerHTML = "<h1>404 - Page Not Found</h1>";
    }
  }

  public navigate(path: string): void {
    window.history.pushState({}, "", path);
    this.route();
  }
}