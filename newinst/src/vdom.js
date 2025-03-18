/** @jsx h */

// Core Utilities
function h(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: flattenChildren(children),
    key: props?.key,
  };
}

function flattenChildren(children) {
  return children
    .flat(Infinity)
    .filter(child => child !== false && child !== null && child !== undefined)
    .map(child => (typeof child === 'object' ? child : String(child)));
}

// DOM Manipulation
function setProp(target, name, value) {
  // Handle special attributes
  if (name === 'className') {
    target.className = value || '';
  } else if (name === 'style' && typeof value === 'object') {
    // Handle style objects like React
    Object.entries(value).forEach(([cssProperty, cssValue]) => {
      // Convert camelCase to kebab-case for CSS properties
      const formattedProperty = cssProperty.replace(/([A-Z])/g, '-$1').toLowerCase();
      target.style[cssProperty] = cssValue;
    });
  } else if (name === 'value' && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    // Handle controlled inputs
    target.value = value || '';
  } else if (name === 'dangerouslySetInnerHTML' && value && value.__html) {
    // React's dangerouslySetInnerHTML equivalent
    target.innerHTML = value.__html;
  } else if (typeof value === 'boolean') {
    // Handle boolean attributes
    target[name] = value;
    value ? target.setAttribute(name, '') : target.removeAttribute(name);
  } else if (!isEventProp(name)) {
    // Regular attributes
    value === null || value === undefined
      ? target.removeAttribute(name)
      : target.setAttribute(name, value);
  }
}

function setProps(target, props) {
  Object.entries(props || {}).forEach(([name, value]) => 
    !isEventProp(name) && setProp(target, name, value)
  );
}

function isEventProp(name) {
  return /^on[A-Z]/.test(name);
}

function getEventName(name) {
  return name.slice(2).toLowerCase();
}

// Add event listeners with proper event delegation
function addEventListeners(target, props) {
  Object.entries(props || {}).forEach(([name, value]) => {
    if (isEventProp(name)) {
      target.addEventListener(getEventName(name), value);
    }
  });
}

// Remove event listeners to prevent memory leaks
function removeEventListeners(target, props) {
  Object.entries(props || {}).forEach(([name, value]) => {
    if (isEventProp(name)) {
      target.removeEventListener(getEventName(name), value);
    }
  });
}

// State Management
class ComponentInstance {
  constructor(component, props = {}) {
    this.component = component;
    this.props = props;
    this.state = [];
    this.effects = [];
    this.cleanups = [];
    this.memos = [];
    this.refs = [];
    this.callbacks = [];
    this.cursor = 0;
    this.prevTree = null;
    this.domNode = null;
    this.isMounted = false;
  }

  useState(initialValue) {
    const cursor = this.cursor++;
    // Support for functional initial state like React
    if (this.state[cursor] === undefined) {
      this.state[cursor] = typeof initialValue === 'function' 
        ? initialValue() 
        : initialValue;
    }
    
    return [
      this.state[cursor],
      (newValue) => {
        // Support for functional updates like React's setState
        const value = typeof newValue === 'function' 
          ? newValue(this.state[cursor]) 
          : newValue;
          
        // Only trigger render if value actually changed (like React)
        if (this.state[cursor] !== value) {
          this.state[cursor] = value;
          queueRender(this);
        }
      },
    ];
  }

  useEffect(callback, deps) {
    const cursor = this.cursor++;
    const prevDeps = this.effects[cursor];
    
    // Handle undefined deps (run on every render) and empty deps (run once)
    const hasChanged = !deps 
      || !prevDeps 
      || deps.length === 0 
      || deps.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged) {
      // Queue effects to run after render like React does
      queueMicrotask(() => {
        // Clean up previous effect if exists
        if (this.cleanups[cursor]) {
          try {
            this.cleanups[cursor]();
          } catch (e) {
            console.error('Error in effect cleanup:', e);
          }
        }
        
        // Only run effects if component is still mounted
        if (this.isMounted) {
          this.effects[cursor] = deps;
          try {
            const cleanup = callback();
            this.cleanups[cursor] = typeof cleanup === 'function' ? cleanup : (() => {});
          } catch (e) {
            console.error('Error in effect:', e);
          }
        }
      });
    }
  }

  // Adding useLayoutEffect that runs synchronously after DOM mutations
  useLayoutEffect(callback, deps) {
    const cursor = this.cursor++;
    const prevDeps = this.effects[cursor];
    
    const hasChanged = !deps 
      || !prevDeps 
      || deps.length === 0 
      || deps.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged) {
      // Run synchronously after all DOM mutations
      if (this.cleanups[cursor]) {
        try {
          this.cleanups[cursor]();
        } catch (e) {
          console.error('Error in layout effect cleanup:', e);
        }
      }
      
      if (this.isMounted) {
        this.effects[cursor] = deps;
        try {
          const cleanup = callback();
          this.cleanups[cursor] = typeof cleanup === 'function' ? cleanup : (() => {});
        } catch (e) {
          console.error('Error in layout effect:', e);
        }
      }
    }
  }

  // Add useMemo hook
  useMemo(factory, deps) {
    const cursor = this.cursor++;
    const prevDeps = this.memos[cursor]?.deps;
    
    const hasChanged = !prevDeps 
      || deps.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged || this.memos[cursor] === undefined) {
      try {
        const value = factory();
        this.memos[cursor] = { value, deps };
      } catch (e) {
        console.error('Error in memo computation:', e);
      }
    }
    
    return this.memos[cursor]?.value;
  }

  // Add useCallback hook
  useCallback(callback, deps) {
    const cursor = this.cursor++;
    const prevDeps = this.callbacks[cursor]?.deps;
    
    const hasChanged = !prevDeps 
      || deps.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged || this.callbacks[cursor] === undefined) {
      this.callbacks[cursor] = { callback, deps };
    }
    
    return this.callbacks[cursor].callback;
  }

  // Add useRef hook
  useRef(initialValue) {
    const cursor = this.cursor++;
    if (this.refs[cursor] === undefined) {
      this.refs[cursor] = { current: initialValue };
    }
    return this.refs[cursor];
  }

  // Run all cleanups when unmounting
  unmount() {
    this.isMounted = false;
    this.cleanups.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        try {
          cleanup();
        } catch (e) {
          console.error('Error in cleanup:', e);
        }
      }
    });
  }
}

// Context API implementation
const ContextRegistry = new Map();

function createContext(defaultValue) {
  const context = {
    Provider: ({ value, children }) => {
      return {
        type: '__ContextProvider__',
        props: { context, value },
        children: [children],
      };
    },
    Consumer: ({ children }) => {
      const consumer = currentRendering;
      const value = consumer ? getContextValue(consumer, context) : defaultValue;
      return typeof children[0] === 'function' ? children[0](value) : null;
    },
    _defaultValue: defaultValue,
  };
  
  return context;
}

function getContextValue(instance, context) {
  // Walk up the tree to find the context value
  let currentNode = instance;
  while (currentNode) {
    const contextValue = ContextRegistry.get(`${currentNode.id}-${context}`);
    if (contextValue !== undefined) {
      return contextValue;
    }
    currentNode = currentNode.parent;
  }
  return context._defaultValue;
}

// Rendering Engine
const instances = new WeakMap();
let instanceCounter = 0;
let renderQueue = new Set();
let isRendering = false;
let currentRendering = null;
let rootInstance = null;

function createElement(node) {
  if (typeof node !== 'object') return document.createTextNode(String(node));

  const { type, props, children } = node;

  // Handle context provider
  if (type === '__ContextProvider__') {
    const contextNode = createElement(children[0]);
    if (currentRendering) {
      ContextRegistry.set(`${currentRendering.id}-${props.context}`, props.value);
    }
    return contextNode;
  }

  if (typeof type === 'function') {
    return mountComponent(node);
  }

  const el = document.createElement(type);
  setProps(el, props);
  addEventListeners(el, props);
  
  children.forEach(child => {
    try {
      const childNode = createElement(child);
      el.appendChild(childNode);
    } catch (e) {
      console.error('Error creating child element:', e);
    }
  });
  
  return el;
}

function mountComponent(node) {
  const { type, props } = node;
  
  let instance = instances.get(node);
  if (!instance) {
    instance = new ComponentInstance(type, props);
    instance.id = `instance-${instanceCounter++}`;
    instances.set(node, instance);
    
    if (currentRendering) {
      instance.parent = currentRendering;
    }
  }
  
  const prevRendering = currentRendering;
  currentRendering = instance;
  instance.cursor = 0;
  
  let tree;
  try {
    tree = instance.component(instance.props);
  } catch (e) {
    console.error('Error rendering component:', e);
    tree = { type: 'div', props: {}, children: [`Error: ${e.message}`] };
  }
  
  currentRendering = prevRendering;
  
  const domNode = createElement(tree);
  instance.domNode = domNode;
  instance.isMounted = true;
  return domNode;
}

function diff(prev, next, parent, index = 0) {
  // Handle missing nodes
  if (!prev && !next) return;
  
  // Add new node
  if (!prev && next) {
    try {
      parent.appendChild(createElement(next));
    } catch (e) {
      console.error('Error appending child:', e);
    }
    return;
  }
  
  // Remove old node
  if (prev && !next) {
    try {
      // Clean up component instance if it's a component node
      const instance = instances.get(prev);
      if (instance) {
        instance.unmount();
        instances.delete(prev);
      }
      
      parent.removeChild(parent.childNodes[index]);
    } catch (e) {
      console.error('Error removing child:', e);
    }
    return;
  }
  
  // Replace if different types
  if (typeof prev !== typeof next || 
      (typeof prev === 'object' && prev.type !== next.type) ||
      typeof prev !== 'object' && String(prev) !== String(next)) {
    try {
      // Clean up old component instance
      const oldInstance = instances.get(prev);
      if (oldInstance) {
        oldInstance.unmount();
      }
      
      parent.replaceChild(createElement(next), parent.childNodes[index]);
    } catch (e) {
      console.error('Error replacing child:', e);
    }
    return;
  }
  
  // Update node if same type
  if (typeof next === 'object') {
    const el = parent.childNodes[index];
    
    // Clear old event listeners to prevent duplicates and update props
    if (prev.props && next.props) {
      removeEventListeners(el, prev.props);
      updateProps(el, next.props, prev.props);
      addEventListeners(el, next.props);
    }
    
    // Key-based reconciliation for improved performance
    if (prev.props?.key && next.props?.key) {
      // If keys exist, use them for reconciliation
      const prevChildrenWithKeys = {};
      const nextChildrenWithKeys = {};
      const childrenWithoutKeys = [];
      const nextIndices = new Set();
      
      // Group children by keys
      prev.children.forEach((child, i) => {
        if (typeof child === 'object' && child.props?.key) {
          prevChildrenWithKeys[child.props.key] = { child, index: i };
        }
      });
      
      next.children.forEach((child, i) => {
        if (typeof child === 'object' && child.props?.key) {
          nextChildrenWithKeys[child.props.key] = { child, index: i };
          nextIndices.add(i);
        } else {
          childrenWithoutKeys.push({ child, index: i });
          nextIndices.add(i);
        }
      });
      
      // Remove children that don't exist in next
      for (let i = parent.childNodes[index].childNodes.length - 1; i >= 0; i--) {
        if (!nextIndices.has(i)) {
          parent.childNodes[index].removeChild(parent.childNodes[index].childNodes[i]);
        }
      }
      
      // Update or move existing children with keys
      Object.keys(nextChildrenWithKeys).forEach(key => {
        const nextItem = nextChildrenWithKeys[key];
        const prevItem = prevChildrenWithKeys[key];
        
        if (prevItem) {
          // Node exists, update it
          diff(prev.children[prevItem.index], next.children[nextItem.index], el, nextItem.index);
        } else {
          // New node with key, create it
          try {
            if (nextItem.index < el.childNodes.length) {
              el.insertBefore(createElement(nextItem.child), el.childNodes[nextItem.index]);
            } else {
              el.appendChild(createElement(nextItem.child));
            }
          } catch (e) {
            console.error('Error creating keyed element:', e);
          }
        }
      });
    } else {
      // Regular reconciliation for non-keyed elements
      const max = Math.max(next.children.length, prev.children.length);
      for (let i = 0; i < max; i++) {
        diff(prev.children[i], next.children[i], el, i);
      }
    }
  }
}

function updateProps(el, newProps = {}, oldProps = {}) {
  // Get all prop names to process
  const allProps = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
  
  allProps.forEach(name => {
    if (!isEventProp(name)) {
      if (oldProps[name] !== newProps[name]) {
        if (name in newProps) {
          setProp(el, name, newProps[name]);
        } else {
          // Remove props that no longer exist
          if (name === 'className') {
            el.className = '';
          } else if (name === 'style') {
            el.removeAttribute('style');
          } else {
            el.removeAttribute(name);
          }
        }
      }
    }
  });
}

function queueRender(instance) {
  renderQueue.add(instance);
  
  if (!isRendering) {
    isRendering = true;
    
    // Use requestAnimationFrame for batched updates like React
    requestAnimationFrame(() => {
      const processedInstances = new Set();
      
      // Process render queue in parent-first order to avoid re-renders
      function processInstance(instance) {
        if (processedInstances.has(instance)) return;
        
        // Process parent first if it's in the queue
        if (instance.parent && renderQueue.has(instance.parent)) {
          processInstance(instance.parent);
          return; // Parent render will include this instance
        }
        
        // Reset cursor for hooks to work
        instance.cursor = 0;
        
        const prevRendering = currentRendering;
        currentRendering = instance;
        
        try {
          const newTree = instance.component(instance.props);
          
          if (instance.domNode && instance.domNode.parentNode) {
            diff(instance.prevTree, newTree, instance.container || instance.domNode.parentNode, 
                 Array.from(instance.domNode.parentNode.childNodes).indexOf(instance.domNode));
            instance.prevTree = newTree;
          }
        } catch (e) {
          console.error('Error during render:', e);
        }
        
        currentRendering = prevRendering;
        
        processedInstances.add(instance);
        renderQueue.delete(instance);
      }
      
      // Process all instances
      renderQueue.forEach(processInstance);
      
      renderQueue.clear();
      isRendering = false;
    });
  }
}

// Framework API
function createApp(rootComponent) {
  return {
    mount(container, initialProps = {}) {
      if (!container) {
        console.error('Mount container not found');
        return null;
      }
      
      try {
        const instance = new ComponentInstance(rootComponent, initialProps);
        instance.id = `root-instance-${instanceCounter++}`;
        rootInstance = instance;
        
        const prevRendering = currentRendering;
        currentRendering = instance;
        instance.cursor = 0;
        
        const tree = instance.component(instance.props);
        currentRendering = prevRendering;
        
        const domNode = createElement(tree);
        container.appendChild(domNode);
        
        instance.prevTree = tree;
        instance.container = container;
        instance.domNode = domNode;
        instance.isMounted = true;
        
        return instance;
      } catch (e) {
        console.error('Error mounting app:', e);
        return null;
      }
    },
    unmount() {
      if (rootInstance) {
        rootInstance.unmount();
        rootInstance = null;
      }
    }
  };
}

// Make global functions available
function useState(initialValue) {
  if (!currentRendering) throw new Error('useState must be called within a component render');
  return currentRendering.useState(initialValue);
}

function useEffect(callback, deps) {
  if (!currentRendering) throw new Error('useEffect must be called within a component render');
  return currentRendering.useEffect(callback, deps);
}

function useLayoutEffect(callback, deps) {
  if (!currentRendering) throw new Error('useLayoutEffect must be called within a component render');
  return currentRendering.useLayoutEffect(callback, deps);
}

function useMemo(factory, deps) {
  if (!currentRendering) throw new Error('useMemo must be called within a component render');
  return currentRendering.useMemo(factory, deps);
}

function useCallback(callback, deps) {
  if (!currentRendering) throw new Error('useCallback must be called within a component render');
  return currentRendering.useCallback(callback, deps);
}

function useRef(initialValue) {
  if (!currentRendering) throw new Error('useRef must be called within a component render');
  return currentRendering.useRef(initialValue);
}

function useContext(context) {
  if (!currentRendering) throw new Error('useContext must be called within a component render');
  return getContextValue(currentRendering, context);
}

// Example Usage
function Counter({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  
  useEffect(() => {
    console.log('Count changed:', count);
    return () => console.log('Cleanup:', count);
  }, [count]);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// TodoApp Example Component
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  
  // Focus input on mount
  useEffect(() => {
    console.log(inputRef)
    if (inputRef.current) {
      console.log('Focusing input');
      inputRef.current.focus();
    }
    console.log('TodoApp mounted');
    return () => console.log('TodoApp unmounted');
  }, []);
  
  // Memoize add todo handler
  const addTodo = useCallback(() => {
    if (input.trim()) {
      setTodos(prevTodos => [...prevTodos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  }, [input]);
  
  // Toggle todo completion
  const toggleTodo = useCallback((id) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);
  
  // Compute completed count
  const completedCount = useMemo(() => {
    return todos.filter(todo => todo.completed).length;
  }, [todos]);
  
  return (
    <div className="todo-app">
      <h1>Todo App ({completedCount}/{todos.length} completed)</h1>
      
      <div className="add-todo">
        <input
        style="width: 200px; padding: 5px; margin-right: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 3px; outline: none; box-shadow: 0 0 5px rgba(0,0,0,0.1);"
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo"
        />
        <button style="Background: red; outline:none; border-radius: 0.5rem;  " onClick={addTodo}>Add</button>
      </div>
      
      <ul className="todo-list">
        {todos.map(todo => (
          <li 
            key={todo.id}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
            onClick={() => toggleTodo(todo.id)}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Mount the app
const App = createApp(TodoApp); // For simpler testing, using Counter
App.mount(document.getElementById('root'), { initialCount: 5 });