import { routes } from "./routes.js";
import { Router } from "./utils/router.js";

const appContainer = document.getElementById("app")!;
const router = new Router(routes, appContainer);
// console.log(routes);

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A" && target.getAttribute("href")) {
      e.preventDefault();
      router.navigate(target.getAttribute("href")!);
    }
  });
});