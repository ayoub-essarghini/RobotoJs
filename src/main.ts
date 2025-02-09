import { routes } from "./routes";
import { Router } from "./utils/router";

const appContainer = document.getElementById("app")!;
const router = new Router(routes, appContainer);
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === "A" && target.getAttribute("href")) {
    e.preventDefault();
    router.navigate(target.getAttribute("href")!);
  }
});

// Initial render
// router.route();