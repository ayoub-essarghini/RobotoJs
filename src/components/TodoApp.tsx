import { h, useState } from "../core/roboto.js";

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

export const TodoApp = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [text, setText] = useState<string>('');
    const [id, setId] = useState<number>(0);

    const addTodo = (text: string) => {
        if (text.trim() === '') return; // Prevent adding empty todos
        setTodos([...todos, { id: id, text: text, completed: false }]);
        setId(id + 1);
        setText(''); // Clear input after adding
        
    };

    const toggleTodo = (id: number) => {
        setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    };

    return (
        <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">Todo App</h1>
            <div class="flex items-center mb-4">
                <input
                    type="text"
                    value={text}
                    onInput={(e: any) => setText((e.target as HTMLInputElement).value)}
                    placeholder="Add a new todo..."
                    class="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md"
                    onClick={() => addTodo(text)}
                >
                    Add
                </button>
            </div>
            <ul class="space-y-2">
                {todos.map(todo => (
                    <li
                        key={todo.id}
                        onClick={() => toggleTodo(todo.id)}
                        class={`p-2 rounded-md cursor-pointer ${
                            todo.completed
                                ? 'bg-green-100 text-green-700 line-through'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                    >
                        {todo.text}
                    </li>
                ))}
            </ul>
            {todos.length === 0 && (
                <p class="text-center text-gray-500 mt-4">No todos yet. Add one above!</p>
            )}
        </div>
    );
};