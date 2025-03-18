import { Route } from './utils/router.js';
// import { Counter } from './components/Counter.js';
import { App } from './components/App.js';


export const routes: Route[] = [
  { path: "/", component: () => App() },
//   { path: "/*", component: NotFound },
];