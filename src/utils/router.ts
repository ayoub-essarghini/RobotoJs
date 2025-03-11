// utils/router.ts
import { patch, VNode } from "./vdom.js";

export type Route = {
  path: string;
  component: { new (onDataUpdated: () => void): { render: () => VNode } };
};

export class Router {
  private routes: Route[];
  private appContainer: HTMLElement;
  private currentVNode: VNode = {
    tag: 'div',
    props: {},
    children: []
  };
  private activeComponent: any = null;

  constructor(routes: Route[], appContainer: HTMLElement) {
    this.routes = routes;
    this.appContainer = appContainer;
    this.init();
  }

  private init(): void {
    window.addEventListener("popstate", () => this.route());
    
    // Use setTimeout to ensure DOM is fully loaded
    setTimeout(() => this.route(), 0);
  }

  private route(): void {
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
    } else {
      this.activeComponent = null;
      const newVNode: VNode = {
        tag: "h1",
        props: {},
        children: ["404 - Page Not Found"]
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