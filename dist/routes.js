import { Home } from "./components/Home.js";
import { About } from "./components/About.js";
import { TodoList } from "./components/TodoList.js";
export const routes = [
    { path: "/", component: Home },
    { path: "/todos", component: TodoList },
    { path: "/about", component: About }
];
