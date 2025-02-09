import { Router } from "./router";
import { Home } from "./components/Home";
import { About } from "./components/About";
import { HttpClient } from "./services/HttpClient";



const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
];

const appContainer = document.getElementById("app")!;
const router = new Router(routes, appContainer);

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === "A" && target.getAttribute("href")) {
    e.preventDefault();
    router.navigate(target.getAttribute("href")!);
  }
});