type Route = {
    path: string;
    component: { new (): { render: () => string } };
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
        const component = new route.component();
        this.appContainer.innerHTML = component.render();
      } else {
        this.appContainer.innerHTML = "<h1>404 - Page Not Found</h1>";
      }
    }
  
    public navigate(path: string): void {
      window.history.pushState({}, "", path);
      this.route();
    }
  }