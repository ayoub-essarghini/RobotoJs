// main.ts
import { routes } from "./routes.js";
import { Router } from "./utils/router.js";

document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("app");
  
  if (!appContainer) {
    console.error("App container not found!");
    return;
  }
  
  const router = new Router(routes, appContainer);
  
  // Global click handler for navigation
  document.addEventListener("click", (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Find closest anchor tag (handles clicking on elements inside an <a> tag)
    let anchorElement: HTMLAnchorElement | null = null;
    let currentElement: HTMLElement | null = target;
    
    while (currentElement && currentElement !== document.body) {
      if (currentElement.tagName === "A") {
        anchorElement = currentElement as HTMLAnchorElement;
        break;
      }
      currentElement = currentElement.parentElement;
    }
    
    if (anchorElement && anchorElement.getAttribute("href")) {
      const href = anchorElement.getAttribute("href") as string;
      
      // Only handle internal links
      if (href.startsWith("/") || href === "#") {
        e.preventDefault();
        router.navigate(href);
      }
    }
  });
});