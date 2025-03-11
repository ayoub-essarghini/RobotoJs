import { useState } from "../core/core.js";
export class TodoList {
    constructor() {
        [this.todos, this.setTodos] = useState([]);
        [this.inputValue, this.setInputValue] = useState('');
    }
    addTodo() {
        if (this.inputValue().trim()) {
            const newTodo = {
                id: Date.now(),
                text: this.inputValue(),
                completed: false
            };
            this.setTodos([...this.todos(), newTodo]);
            this.setInputValue('');
            this.render();
        }
    }
    toggleTodo(id) {
        const updatedTodos = this.todos().map(todo => todo.id === id ? Object.assign(Object.assign({}, todo), { completed: !todo.completed }) : todo);
        this.setTodos(updatedTodos);
        this.render();
    }
    deleteTodo(id) {
        const filteredTodos = this.todos().filter(todo => todo.id !== id);
        this.setTodos(filteredTodos);
        this.render();
    }
    render() {
        return {
            tag: 'div',
            props: { class: 'home-container' },
            children: [
                {
                    tag: 'h1',
                    props: { class: 'home-title' },
                    children: ['Todo List']
                },
                {
                    tag: 'div',
                    props: { class: 'flex gap-2 mb-4' },
                    children: [
                        {
                            tag: 'input',
                            props: {
                                type: 'text',
                                value: this.inputValue(),
                                class: 'px-2 py-1 border rounded',
                                onchange: (e) => {
                                    this.setInputValue(e.target.value);
                                    this.render();
                                }
                            },
                            children: []
                        },
                        {
                            tag: 'button',
                            props: {
                                class: 'home-link',
                                onclick: () => this.addTodo()
                            },
                            children: ['Add Todo']
                        }
                    ]
                },
                {
                    tag: 'ul',
                    props: { class: 'space-y-2' },
                    children: this.todos().map(todo => ({
                        tag: 'li',
                        props: { class: 'flex items-center gap-2 bg-white p-2 rounded shadow' },
                        children: [
                            {
                                tag: 'input',
                                props: {
                                    type: 'checkbox',
                                    checked: todo.completed,
                                    onclick: () => this.toggleTodo(todo.id)
                                },
                                children: []
                            },
                            {
                                tag: 'span',
                                props: {
                                    class: todo.completed ? 'line-through text-gray-500' : ''
                                },
                                children: [todo.text]
                            },
                            {
                                tag: 'button',
                                props: {
                                    class: 'ml-auto text-red-500 hover:text-red-700',
                                    onclick: () => this.deleteTodo(todo.id)
                                },
                                children: ['Delete']
                            }
                        ]
                    }))
                }
            ]
        };
    }
}
