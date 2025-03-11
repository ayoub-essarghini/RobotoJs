
import { VNode } from "../utils/vdom.js";
import { Component } from "../utils/types.js";
import { useState } from "../core/core.js";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export class TodoList implements Component {
  private todos: () => Todo[];
  private setTodos: (value: Todo[]) => void;
  private inputValue: () => string;
  private setInputValue: (value: string) => void;
  private onDataUpdated: () => void;

  constructor(onDataUpdated: () => void) {
    this.onDataUpdated = onDataUpdated;
    [this.todos, this.setTodos] = useState<Todo[]>([]);
    [this.inputValue, this.setInputValue] = useState<string>('');
    this.setTodos([
      {id: 1, text: 'Learn JavaScript', completed: false},
      {id: 2, text: 'Learn TypeScript', completed: false},
      {id: 3, text: 'Learn React', completed: false},
      {id: 4, text: 'Learn Vue', completed: false}
    ]);
  }

  

  addTodo(): void {
    console.log('Adding todo...');
    if (this.inputValue().trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: this.inputValue(),
        completed: false
      };
      this.setTodos([...this.todos(), newTodo]);
      this.setInputValue('');
      for (let i = 0; i < this.todos().length; i++) {
        console.log(this.todos()[i].text);
      }
      // console.log('Todo added:', newTodo);
      this.onDataUpdated();
    }
  }

  toggleTodo(id: number): void {
    const updatedTodos = this.todos().map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.setTodos(updatedTodos);

    this.render();
  }

  deleteTodo(id: number): void {
    const filteredTodos = this.todos().filter(todo => todo.id !== id);
    this.setTodos(filteredTodos);
    
    this.render();
  }

  render(): VNode {
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
                onchange: (e: Event) => {
                  this.setInputValue((e.target as HTMLInputElement).value);
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