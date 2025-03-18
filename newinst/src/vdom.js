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
  if (name === 'className') {
    target.className = value || '';
  } else if (typeof value === 'boolean') {
    target[name] = value;
    value ? target.setAttribute(name, '') : target.removeAttribute(name);
  } else if (!isEventProp(name)) {
    target.setAttribute(name, value);
  }
}

function setProps(target, props) {
  Object.entries(props || {}).forEach(([name, value]) => setProp(target, name, value));
}

function isEventProp(name) {
  return /^on[A-Z]/.test(name);
}

function getEventName(name) {
  return name.slice(2).toLowerCase();
}

// State Management
class ComponentInstance {
  constructor(component, props = {}) {
    this.component = component;
    this.props = props;
    this.state = [];
    this.effects = [];
    this.cleanups = [];
    this.cursor = 0;
    this.prevTree = null;
  }

  useState(initialValue) {
    const cursor = this.cursor++;
    if (this.state[cursor] === undefined) {
      this.state[cursor] = initialValue;
    }
    return [
      this.state[cursor],
      (newValue) => {
        this.state[cursor] = newValue;
        queueRender(this);
      },
    ];
  }

  useEffect(callback, deps) {
    const cursor = this.cursor++;
    const prevDeps = this.effects[cursor];
    const hasChanged = !prevDeps || deps.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged) {
      if (this.cleanups[cursor]) this.cleanups[cursor]();
      this.effects[cursor] = deps;
      this.cleanups[cursor] = callback() || (() => {});
    }
  }
}

// Rendering Engine
const instances = new WeakMap();
let renderQueue = new Set();
let isRendering = false;
let currentRendering = null;

function createElement(node) {
  if (typeof node !== 'object') return document.createTextNode(String(node));

  const { type, props, children } = node;

  if (typeof type === 'function') {
    return mountComponent(node);
  }

  const el = document.createElement(type);
  setProps(el, props);
  Object.entries(props || {}).forEach(([name, value]) => {
    if (isEventProp(name)) {
      el.addEventListener(getEventName(name), value);
    }
  });
  children.forEach(child => el.appendChild(createElement(child)));
  return el;
}

function mountComponent(node) {
  let instance = instances.get(node);
  if (!instance) {
    instance = new ComponentInstance(node.type, node.props);
    instances.set(node, instance);
  }
  currentRendering = instance;
  instance.cursor = 0;
  const tree = instance.component(instance.props);
  currentRendering = null;
  return createElement(tree);
}

function diff(prev, next, parent, index = 0) {
  if (!prev && next) {
    parent.appendChild(createElement(next));
  } else if (prev && !next) {
    parent.removeChild(parent.childNodes[index]);
  } else if (typeof prev !== typeof next || prev.type !== next.type) {
    parent.replaceChild(createElement(next), parent.childNodes[index]);
  } else {
    const el = parent.childNodes[index];
    updateProps(el, next.props, prev.props);
    const max = Math.max(next.children.length, prev.children.length);
    for (let i = 0; i < max; i++) {
      diff(prev.children[i], next.children[i], el, i);
    }
  }
}

function updateProps(el, newProps, oldProps = {}) {
  Object.keys({ ...oldProps, ...newProps }).forEach(name => {
    if (!isEventProp(name) && oldProps[name] !== newProps[name]) {
      setProp(el, name, newProps[name] || '');
    }
  });
}

function queueRender(instance) {
  renderQueue.add(instance);
  if (!isRendering) {
    isRendering = true;
    requestAnimationFrame(() => {
      renderQueue.forEach(instance => {
        instance.cursor = 0;
        const newTree = instance.component(instance.props);
        diff(instance.prevTree, newTree, instance.container);
        instance.prevTree = newTree;
      });
      renderQueue.clear();
      isRendering = false;
    });
  }
}

// Framework API
function createApp(rootComponent) {
  return {
    mount(container, initialProps = {}) {
      const instance = new ComponentInstance(rootComponent, initialProps);
      const tree = instance.component(instance.props);
      container.appendChild(createElement(tree));
      instance.prevTree = tree;
      instance.container = container;
      return instance;
    },
  };
}

function useState(initialValue) {
  if (!currentRendering) throw new Error('useState must be called within a component render');
  return currentRendering.useState(initialValue);
}

function useEffect(callback, deps) {
  if (!currentRendering) throw new Error('useEffect must be called within a component render');
  return currentRendering.useEffect(callback, deps);
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

// Mount the app
const App = createApp(Counter);
App.mount(document.getElementById('root'), { initialCount: 5 });
