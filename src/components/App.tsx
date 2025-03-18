import { h, useEffect, useState } from "../core/roboto.js";
import { Counter } from "./Counter.js";
import { TodoApp } from "./TodoApp.js";

export const App = () => {
  const [todo, setTodo] = useState<boolean>(true);

 
  return (
    <div>
      {todo && <TodoApp />}
      {!todo && <Counter />}
    </div>
  );
};
