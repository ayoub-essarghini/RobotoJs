import { Router } from "./router";
import { Home } from "./components/Home";
import { About } from "./components/About";
const routes = [
    { path: "/", component: Home },
    { path: "/about", component: About },
];
const appContainer = document.getElementById("app");
const router = new Router(routes, appContainer);
document.addEventListener("click", (e) => {
    const target = e.target;
    if (target.tagName === "A" && target.getAttribute("href")) {
        e.preventDefault();
        router.navigate(target.getAttribute("href"));
    }
});
