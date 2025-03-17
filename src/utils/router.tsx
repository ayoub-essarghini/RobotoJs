import { createElement, render } from "../core/roboto.js";

export type Route = {
  path: string;
  component: () => any;
};

export class Router {
  private routes: Route[];
  private appContainer: HTMLElement;
  private isNavigating: boolean = false;

  private get currentPath(): string {
    return window.location.pathname;
  }

  constructor(routes: Route[], appContainer: HTMLElement) {
    this.routes = routes;
    this.appContainer = appContainer;
    this.init();
  }

  private init(): void {
    window.addEventListener("popstate", () => this.route());
    
    // Use setTimeout to ensure DOM is fully loaded
    // setTimeout(() => this.route(), 0);
  }

  public route(): void {
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
      // Clear the container completely before mounting a new component
      this.appContainer.innerHTML = '';
      
      // Get the component function
      const ComponentFunction = route.component;
      
      // Render the component using JSX
      render(<ComponentFunction />, this.appContainer);
    } else {
      this.appContainer.innerHTML = '';
      render(<div>404 - Page Not Found</div>, this.appContainer);
    }
    
    this.isNavigating = false;
  }

  private updateNavigationVisibility(): void {
    const navElement = document.querySelector('ul');
    if (navElement) {
      if (this.currentPath === '/login' || 
          (!this.routes.some(r => r.path === this.currentPath) && this.currentPath !== '/')) {
        navElement.style.display = 'none';
      } else {
        navElement.style.display = 'block';
      }
    }
  }

  public navigate(path: string): void {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
      this.route();
    }
  }
}