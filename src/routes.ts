

import { Home } from "./components/Home.js";
import { About } from "./components/About.js";
import { Route } from "./utils/router.js";

export const routes : Route[] = [
  { path: "/", component: Home },
  {path: "/about", component: About}

];