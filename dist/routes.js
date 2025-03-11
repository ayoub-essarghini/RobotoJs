import { Home } from "./components/Home.js";
import { About } from "./components/About.js";
import { TodoList } from "./components/TodoList.js";
import { Login } from "./components/Login.js";
import { NotFound } from "./components/NotFound.js";
export const routes = [
    { path: "/", component: Home },
    { path: "/login", component: Login },
    { path: "/todos", component: TodoList },
    { path: "/about", component: About },
    { path: "/*", component: NotFound },
];
