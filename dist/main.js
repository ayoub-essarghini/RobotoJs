import { routes } from "./routes.js";
import { Router } from "./utils/router.js";
const appContainer = document.getElementById('root');
const router = new Router(routes, appContainer);
// Example navigation (optional)
document.querySelectorAll('a[data-navigate]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.getAttribute('data-navigate');
        router.navigate(path);
    });
});
