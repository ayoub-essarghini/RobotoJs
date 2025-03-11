

import { Home } from "./components/Home.js";
import { About } from "./components/About.js";
import { Route } from "./utils/router.js";
import { TodoList } from "./components/TodoList.js";

export const routes : Route[] = [
  { path: "/", component: Home },
  {path: "/todos", component: TodoList},
  {path: "/about", component: About}

];