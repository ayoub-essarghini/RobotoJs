// Core Types
export interface VNode {
  type: string | ((props: Props) => VNode);
  props: Props;
  children: VNodeChild[];
  key?: string | number;
}

type VNodeChild = VNode | string | number | boolean | null | undefined;

interface Props {
  [key: string]: any;
  key?: string | number;
  children?: VNodeChild | VNodeChild[];
}

interface Ref<T> {
  current: T;
}

interface Context<T> {
  Provider: ({ value, children }: { value: T; children: VNodeChild }) => VNode;
  Consumer: ({ children }: { children: ((value: T) => VNodeChild)[] }) => VNodeChild;
  _defaultValue: T;
  _id: string; // Add unique ID to each context
}

// Core Utilities
export function h(type: string | ((props: any) => VNode), props: any | null, ...children: VNodeChild[]): VNode {
  return {
    type,
    props: props || {},
    children: flattenChildren(children),
    key: props?.key,
  };
}

function flattenChildren(children: VNodeChild[]): VNodeChild[] {
  return children
    .flat(Infinity)
    .filter(child => child !== false && child !== null && child !== undefined)
    .map(child => (typeof child === 'object' && child !== null ? child : String(child)));
}

// DOM Manipulation
function setProp(target: HTMLElement, name: string, value: any): void {
  if (name === 'className') {
    target.className = value || '';
  } else if (name === 'style' && typeof value === 'object') {
    Object.entries(value).forEach(([cssProperty, cssValue]) => {
      const formattedProperty = cssProperty.replace(/([A-Z])/g, '-$1').toLowerCase();
      (target.style as any)[cssProperty] = cssValue;
    });
  } else if (name === 'value' && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
    (target as HTMLInputElement).value = value ?? '';
  } else if (name === 'checked' && target.tagName === 'INPUT') {
    (target as HTMLInputElement).checked = !!value;
  } else if (name === 'dangerouslySetInnerHTML' && value && value.__html) {
    target.innerHTML = value.__html;
  } else if (typeof value === 'boolean') {
    if (value) {
      target.setAttribute(name, '');
    } else {
      target.removeAttribute(name);
    }
    // Handle properties vs attributes appropriately
    if (name in target) {
      (target as any)[name] = value;
    }
  } else if (!isEventProp(name)) {
    if (value === null || value === undefined) {
      target.removeAttribute(name);
    } else {
      target.setAttribute(name, value);
    }
  }
}

function setProps(target: HTMLElement, props: Props): void {
  Object.entries(props || {}).forEach(([name, value]) => 
    !isEventProp(name) && setProp(target, name, value)
  );
}

function isEventProp(name: string): boolean {
  return /^on[A-Z]/.test(name);
}

function getEventName(name: string): string {
  return name.slice(2).toLowerCase();
}

// Store event handlers to properly clean them up
const eventHandlers = new WeakMap<HTMLElement, Map<string, EventListener>>();

function addEventListeners(target: HTMLElement, props: Props): void {
  if (!eventHandlers.has(target)) {
    eventHandlers.set(target, new Map());
  }
  
  const handlers = eventHandlers.get(target)!;
  
  Object.entries(props || {}).forEach(([name, value]) => {
    if (isEventProp(name) && typeof value === 'function') {
      const eventName = getEventName(name);
      const handler = value as EventListener;
      
      handlers.set(eventName, handler);
      target.addEventListener(eventName, handler);
    }
  });
}

function removeEventListeners(target: HTMLElement, props: Props): void {
  const handlers = eventHandlers.get(target);
  if (!handlers) return;

  if (props) {
    // Remove specific event listeners
    Object.keys(props).forEach(name => {
      if (isEventProp(name)) {
        const eventName = getEventName(name);
        const handler = handlers.get(eventName);
        if (handler) {
          target.removeEventListener(eventName, handler);
          handlers.delete(eventName);
        }
      }
    });
  } else {
    // Remove all event listeners (for element removal)
    handlers.forEach((handler, eventName) => {
      target.removeEventListener(eventName, handler);
    });
    handlers.clear();
    eventHandlers.delete(target);
  }
}

// State Management
export class ComponentInstance {
  component: (props: Props) => VNode;
  props: Props;
  private state: any[];
  private effects: (any[] | undefined)[];
  private cleanups: ((() => void) | undefined)[];
  private memos: { value: any; deps: any[] }[];
  private refs: Ref<any>[];
  private callbacks: { callback: Function; deps: any[] }[];
  private cursor: number;
  prevTree: VNode | null;
  domNode: Node | null;
  container?: Node;
  id: string;
  isMounted: boolean;
  parent?: ComponentInstance;
  renderPending: boolean;

  constructor(component: (props: Props) => VNode, props: Props = {}) {
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
    this.id = '';
    this.isMounted = false;
    this.renderPending = false;
  }

  useState<T>(initialValue: T | (() => T)): [T, (newValue: T | ((prev: T) => T)) => void] {
    const cursor = this.cursor++;
    if (this.state[cursor] === undefined) {
      this.state[cursor] = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }
    
    return [
      this.state[cursor],
      (newValue: T | ((prev: T) => T)) => {
        const value = typeof newValue === 'function' ? (newValue as (prev: T) => T)(this.state[cursor]) : newValue;
        if (this.state[cursor] !== value) {
          this.state[cursor] = value;
          queueRender(this);
        }
      },
    ];
  }

  useEffect(callback: () => void | (() => void), deps?: any[]): void {
    const cursor = this.cursor++;
    const prevDeps = this.effects[cursor];
    const hasChanged = !deps || !prevDeps || deps.length === 0 || 
      deps.length !== prevDeps.length || 
      deps.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged) {
      queueMicrotask(() => {
        if (!this.isMounted) return;
        
        if (this.cleanups[cursor]) {
          try {
            this.cleanups[cursor]!();
          } catch (e) {
            console.error('Error in effect cleanup:', e);
          }
        }
        
        this.effects[cursor] = deps;
        try {
          const cleanup = callback();
          this.cleanups[cursor] = typeof cleanup === 'function' ? cleanup : undefined;
        } catch (e) {
          console.error('Error in effect:', e);
        }
      });
    }
  }

  useLayoutEffect(callback: () => void | (() => void), deps?: any[]): void {
    const cursor = this.cursor++;
    const prevDeps = this.effects[cursor];
    const hasChanged = !deps || !prevDeps || deps.length === 0 || 
      deps.length !== prevDeps.length ||
      deps.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged) {
      if (this.cleanups[cursor]) {
        try {
          this.cleanups[cursor]!();
        } catch (e) {
          console.error('Error in layout effect cleanup:', e);
        }
      }
      
      if (this.isMounted) {
        this.effects[cursor] = deps;
        try {
          const cleanup = callback();
          this.cleanups[cursor] = typeof cleanup === 'function' ? cleanup : undefined;
        } catch (e) {
          console.error('Error in layout effect:', e);
        }
      }
    }
  }

  useMemo<T>(factory: () => T, deps: any[]): T {
    const cursor = this.cursor++;
    const prevDeps = this.memos[cursor]?.deps;
    const hasChanged = !prevDeps || 
      deps.length !== prevDeps.length ||
      deps.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged || this.memos[cursor] === undefined) {
      try {
        const value = factory();
        this.memos[cursor] = { value, deps };
      } catch (e) {
        console.error('Error in memo computation:', e);
        if (this.memos[cursor] === undefined) {
          // Provide a fallback value if no previous value exists
          this.memos[cursor] = { value: undefined, deps };
        }
      }
    }
    return this.memos[cursor]!.value;
  }

  useCallback<T extends Function>(callback: T, deps: any[]): T {
    const cursor = this.cursor++;
    const prevDeps = this.callbacks[cursor]?.deps;
    const hasChanged = !prevDeps || 
      deps.length !== prevDeps.length ||
      deps.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged || this.callbacks[cursor] === undefined) {
      this.callbacks[cursor] = { callback, deps };
    }
    return this.callbacks[cursor].callback as T;
  }

  useRef<T>(initialValue: T): Ref<T> {
    const cursor = this.cursor++;
    if (this.refs[cursor] === undefined) {
      this.refs[cursor] = { current: initialValue };
    }
    return this.refs[cursor] as Ref<T>;
  }

  unmount(): void {
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
    
    // Clean up all event listeners
    if (this.domNode instanceof HTMLElement) {
      removeEventListeners(this.domNode, null as any);
    }
    
    // Clean context registry entries for this instance
    cleanupContextForInstance(this.id);
  }

  getCursor(): number {
    return this.cursor;
  }

  setCursor(cursor: number): void {
    this.cursor = cursor;
  }
}

// Context API with improved memory management
const ContextRegistry = new Map<string, Map<string, any>>();
let contextCounter = 0;

function cleanupContextForInstance(instanceId: string): void {
  ContextRegistry.forEach((instanceMap, contextId) => {
    instanceMap.delete(instanceId);
    if (instanceMap.size === 0) {
      ContextRegistry.delete(contextId);
    }
  });
}

export function createContext<T>(defaultValue: T): Context<T> {
  const contextId = `context-${contextCounter++}`;
  
  const context: Context<T> = {
    Provider: ({ value, children }: { value: T; children: VNodeChild }) => {
      return {
        type: '__ContextProvider__' as const,
        props: { context, value },
        children: [children],
      };
    },
    Consumer: ({ children }: { children: ((value: T) => VNodeChild)[] }) => {
      const consumer = currentRendering;
      const value = consumer ? getContextValue(consumer, context) : defaultValue;
      return typeof children[0] === 'function' ? children[0](value) : null;
    },
    _defaultValue: defaultValue,
    _id: contextId
  };
  
  return context;
}

function getContextValue<T>(instance: ComponentInstance, context: Context<T>): T {
  if (!ContextRegistry.has(context._id)) {
    return context._defaultValue;
  }
  
  const instanceMap = ContextRegistry.get(context._id)!;
  
  // Walk up the instance tree to find the nearest provider
  let currentNode: ComponentInstance | undefined = instance;
  while (currentNode) {
    if (instanceMap.has(currentNode.id)) {
      return instanceMap.get(currentNode.id) as T;
    }
    currentNode = currentNode.parent;
  }
  
  return context._defaultValue;
}

function setContextValue<T>(instance: ComponentInstance, context: Context<T>, value: T): void {
  if (!ContextRegistry.has(context._id)) {
    ContextRegistry.set(context._id, new Map());
  }
  
  const instanceMap = ContextRegistry.get(context._id)!;
  instanceMap.set(instance.id, value);
}

// Rendering Engine
const instances = new WeakMap<VNode, ComponentInstance>();
let instanceCounter = 0;
let renderQueue = new Set<ComponentInstance>();
let isRendering = false;
let currentRendering: ComponentInstance | null = null;
let rootInstance: ComponentInstance | null = null;

function createElement(node: VNodeChild): Node {
  if (typeof node !== 'object' || node === null) return document.createTextNode(String(node));

  const { type, props, children } = node as VNode;

  if (type === '__ContextProvider__') {
    if (currentRendering) {
      setContextValue(currentRendering, props.context, props.value);
    }
    return createElement(children[0]);
  }

  if (typeof type === 'function') {
    return mountComponent(node as VNode);
  }

  const el = document.createElement(type as string);
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

function mountComponent(node: VNode): Node {
  const { type, props } = node;
  
  let instance = instances.get(node);
  if (!instance) {
    instance = new ComponentInstance(type as (props: Props) => VNode, props);
    instance.id = `instance-${instanceCounter++}`;
    instances.set(node, instance);
    
    if (currentRendering) {
      instance.parent = currentRendering;
    }
  }
  
  const prevRendering = currentRendering;
  currentRendering = instance;
  instance.setCursor(0);
  
  let tree: VNode;
  try {
    tree = instance.component(instance.props);
  } catch (e) {
    console.error('Error rendering component:', e);
    tree = { type: 'div', props: { className: 'error-boundary' }, children: [`Error: ${(e as Error).message}`] };
  }
  
  currentRendering = prevRendering;
  
  const domNode = createElement(tree);
  instance.domNode = domNode;
  instance.prevTree = tree;
  instance.isMounted = true;
  return domNode;
}

function diff(prev: VNodeChild | undefined, next: VNodeChild | undefined, parent: Node, index = 0): void {
  if (!prev && !next) return;
  
  // Case 1: Add new node
  if (!prev && next) {
    try {
      parent.appendChild(createElement(next));
    } catch (e) {
      console.error('Error appending child:', e);
    }
    return;
  }
  
  // Case 2: Remove old node
  if (prev && !next) {
    try {
      if (index < parent.childNodes.length) {
        const nodeToRemove = parent.childNodes[index];
        
        // Unmount component if needed
        if (typeof prev === 'object' && prev !== null) {
          const instance = instances.get(prev as VNode);
          if (instance) {
            instance.unmount();
            instances.delete(prev as VNode);
          }
        }
        
        parent.removeChild(nodeToRemove);
      }
    } catch (e) {
      console.error('Error removing child:', e);
    }
    return;
  }
  
  // If we reach here, both prev and next exist
  // Case 3: Different node types
  if (typeof prev !== typeof next || 
      (typeof prev === 'object' && prev !== null && typeof next === 'object' && next !== null && 
       (prev as VNode).type !== (next as VNode).type) ||
      typeof prev !== 'object' && String(prev) !== String(next)) {
    try {
      // Handle component unmounting
      if (typeof prev === 'object' && prev !== null) {
        const oldInstance = instances.get(prev as VNode);
        if (oldInstance) {
          oldInstance.unmount();
          instances.delete(prev as VNode);
        }
      }
      
      if (index < parent.childNodes.length) {
        parent.replaceChild(createElement(next!), parent.childNodes[index]);
      } else {
        parent.appendChild(createElement(next!));
      }
    } catch (e) {
      console.error('Error replacing child:', e);
    }
    return;
  }
  
  // Case 4: Update existing node
  if (typeof next === 'object' && next !== null && typeof prev === 'object' && prev !== null) {
    // Handle function components
    if (typeof (next as VNode).type === 'function' && typeof (prev as VNode).type === 'function') {
      const instance = instances.get(prev as VNode);
      if (instance) {
        // Update props
        instance.props = (next as VNode).props;
        instances.set(next as VNode, instance);
        instances.delete(prev as VNode);
        
        // Rerender component
        const prevRendering = currentRendering;
        currentRendering = instance;
        instance.setCursor(0);
        
        try {
          const newTree = instance.component(instance.props);
          
          if (instance.domNode && instance.domNode.parentNode) {
            diff(instance.prevTree, newTree, instance.domNode.parentNode, 
                Array.from(instance.domNode.parentNode.childNodes).indexOf(instance.domNode as ChildNode));
            instance.prevTree = newTree;
          }
        } catch (e) {
          console.error('Error updating component:', e);
        }
        
        currentRendering = prevRendering;
        return;
      }
    }
    
    // Handle DOM elements
    if (typeof (next as VNode).type === 'string' && parent.childNodes[index]) {
      const el = parent.childNodes[index] as HTMLElement;
      
      // Update props and event listeners
      if ((prev as VNode).props && (next as VNode).props) {
        removeEventListeners(el, (prev as VNode).props);
        updateProps(el, (next as VNode).props, (prev as VNode).props);
        addEventListeners(el, (next as VNode).props);
      }
      
      // Handle children with keys
      const prevChildren = (prev as VNode).children;
      const nextChildren = (next as VNode).children;
      
      // Improved key-based reconciliation
      const keyed = hasKeyedChildren(prevChildren, nextChildren);
      
      if (keyed) {
        updateKeyedChildren(el, prevChildren, nextChildren);
      } else {
        // Standard reconciliation for non-keyed children
        const max = Math.max(prevChildren.length, nextChildren.length);
        for (let i = 0; i < max; i++) {
          diff(prevChildren[i], nextChildren[i], el, i);
        }
      }
    }
  }
}

function hasKeyedChildren(prevChildren: VNodeChild[], nextChildren: VNodeChild[]): boolean {
  // Check if at least one child on either side has a key
  return prevChildren.some(child => 
    typeof child === 'object' && child !== null && (child as VNode).props?.key !== undefined
  ) || nextChildren.some(child => 
    typeof child === 'object' && child !== null && (child as VNode).props?.key !== undefined
  );
}

function updateKeyedChildren(parent: Node, prevChildren: VNodeChild[], nextChildren: VNodeChild[]): void {
  // Create maps for keyed elements
  const prevKeyMap = new Map<string | number, { child: VNodeChild, index: number }>();
  const nextKeyMap = new Map<string | number, { child: VNodeChild, index: number }>();
  
  // Map prev children with keys
  prevChildren.forEach((child, i) => {
    if (typeof child === 'object' && child !== null && (child as VNode).props?.key !== undefined) {
      prevKeyMap.set((child as VNode).props!.key!, { child, index: i });
    }
  });
  
  // Find children that should remain at their positions, be moved, or be created
  const operations: Array<{
    type: 'keep' | 'move' | 'create' | 'remove';
    child?: VNodeChild;
    fromIndex?: number;
    toIndex?: number;
    key?: string | number;
  }> = [];
  
  // First pass: identify elements to keep, move, or create
  nextChildren.forEach((child, i) => {
    if (typeof child === 'object' && child !== null && (child as VNode).props?.key !== undefined) {
      const key = (child as VNode).props!.key!;
      nextKeyMap.set(key, { child, index: i });
      
      if (prevKeyMap.has(key)) {
        const prevPos = prevKeyMap.get(key)!.index;
        if (prevPos === i) {
          // Element stays at same position
          operations.push({ type: 'keep', child, toIndex: i, key });
        } else {
          // Element needs to be moved
          operations.push({ type: 'move', child, fromIndex: prevPos, toIndex: i, key });
        }
      } else {
        // New element with key
        operations.push({ type: 'create', child, toIndex: i, key });
      }
    } else {
      // New element without key
      operations.push({ type: 'create', child, toIndex: i });
    }
  });
  
  // Second pass: identify elements to remove
  prevKeyMap.forEach(({ child, index }, key) => {
    if (!nextKeyMap.has(key)) {
      operations.push({ type: 'remove', fromIndex: index, key });
    }
  });
  
  // Sort operations to minimize DOM changes
  operations.sort((a, b) => {
    // Remove operations first
    if (a.type === 'remove' && b.type !== 'remove') return -1;
    if (a.type !== 'remove' && b.type === 'remove') return 1;
    
    // Then handle moves and keeps by index
    if (a.toIndex !== undefined && b.toIndex !== undefined) {
      return a.toIndex - b.toIndex;
    }
    
    return 0;
  });
  
  // Execute operations
  operations.forEach(op => {
    switch (op.type) {
      case 'keep':
        // Update element in place
        if (op.child && op.toIndex !== undefined) {
          const prevChild = prevKeyMap.get(op.key!)!.child;
          diff(prevChild, op.child, parent, op.toIndex);
        }
        break;
        
      case 'move':
        // Move and update element
        if (op.child && op.toIndex !== undefined && op.fromIndex !== undefined) {
          const prevChild = prevKeyMap.get(op.key!)!.child;
          
          // Create a placeholder if needed
          if (parent.childNodes.length <= op.toIndex) {
            parent.appendChild(document.createTextNode(''));
          }
          
          // Move element to new position
          if (op.fromIndex < parent.childNodes.length) {
            const nodeToMove = parent.childNodes[op.fromIndex];
            parent.insertBefore(nodeToMove, parent.childNodes[op.toIndex]);
            
            // Update the element after moving
            diff(prevChild, op.child, parent, op.toIndex);
          }
        }
        break;
        
      case 'create':
        // Create new element
        if (op.child && op.toIndex !== undefined) {
          const newNode = createElement(op.child);
          
          if (op.toIndex < parent.childNodes.length) {
            parent.insertBefore(newNode, parent.childNodes[op.toIndex]);
          } else {
            parent.appendChild(newNode);
          }
        }
        break;
        
      case 'remove':
        // Remove element
        if (op.fromIndex !== undefined && op.fromIndex < parent.childNodes.length) {
          // Unmount component if needed
          if (op.key !== undefined) {
            const prevChild = prevKeyMap.get(op.key)!.child;
            if (typeof prevChild === 'object' && prevChild !== null) {
              const instance = instances.get(prevChild as VNode);
              if (instance) {
                instance.unmount();
                instances.delete(prevChild as VNode);
              }
            }
          }
          
          parent.removeChild(parent.childNodes[op.fromIndex]);
        }
        break;
    }
  });
}

function updateProps(el: HTMLElement, newProps: Props = {}, oldProps: Props = {}): void {
  const allProps = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
  
  allProps.forEach(name => {
    if (!isEventProp(name)) {
      if (oldProps[name] !== newProps[name]) {
        if (name in newProps) {
          setProp(el, name, newProps[name]);
        } else {
          if (name === 'className') {
            el.className = '';
          } else if (name === 'style') {
            el.removeAttribute('style');
          } else if (name === 'dangerouslySetInnerHTML') {
            el.innerHTML = '';
          } else if (name === 'value' && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
            (el as HTMLInputElement).value = '';
          } else if (name === 'checked' && el.tagName === 'INPUT') {
            (el as HTMLInputElement).checked = false;
          } else {
            // Handle boolean props correctly on removal
            if (name in el && typeof (el as any)[name] === 'boolean') {
              (el as any)[name] = false;
            }
            el.removeAttribute(name);
          }
        }
      }
    }
  });
}

function queueRender(instance: ComponentInstance): void {
  if (instance.renderPending) return;
  instance.renderPending = true;
  
  renderQueue.add(instance);
  
  if (!isRendering) {
    isRendering = true;
    
    requestAnimationFrame(() => {
      const processedInstances = new Set<ComponentInstance>();
      
      function processInstance(instance: ComponentInstance) {
        if (processedInstances.has(instance)) return;
        
        if (instance.parent && renderQueue.has(instance.parent)) {
          processInstance(instance.parent);
          return;
        }
        
        instance.setCursor(0);
        instance.renderPending = false;
        
        const prevRendering = currentRendering;
        currentRendering = instance;
        
        try {
          const newTree = instance.component(instance.props);
          
          if (instance.domNode && instance.domNode.parentNode) {
            const parentNode = instance.container || instance.domNode.parentNode;
            const index = Array.from(parentNode.childNodes).indexOf(instance.domNode as ChildNode);
            diff(instance.prevTree, newTree, parentNode, index);
            instance.prevTree = newTree;
          }
        } catch (e) {
          console.error('Error during render:', e);
        }
        
        currentRendering = prevRendering;
        
        processedInstances.add(instance);
        renderQueue.delete(instance);
      }
      
      // Process instances in parent-to-child order
      renderQueue.forEach(processInstance);
      renderQueue.clear();
      isRendering = false;
    });
  }
}

// Framework API
export function createApp(rootComponent: (props: Props) => VNode) {
  return {
    mount(container: HTMLElement, initialProps: Props = {}): ComponentInstance | null {
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
        instance.setCursor(0);
        
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
    unmount(): void {
      if (rootInstance && rootInstance.domNode && rootInstance.domNode.parentNode) {
        rootInstance.unmount();
        if (rootInstance.prevTree) {
          instances.delete(rootInstance.prevTree);
        }
        
        try {
          rootInstance.domNode.parentNode.removeChild(rootInstance.domNode);
        } catch (e) {
          console.error('Error removing root node:', e);
        }
        
        rootInstance = null;
      }
    }
  };
}


// Hooks API
export function useState<T>(initialValue: T | (() => T)): [T, (newValue: T | ((prev: T) => T)) => void] {
  if (!currentRendering) throw new Error('useState must be called within a component render');
  return currentRendering.useState(initialValue);
}
export function useEffect(callback: () => void | (() => void), deps?: any[]): void {
  if (!currentRendering) throw new Error('useEffect must be called within a component render');
  return currentRendering.useEffect(callback, deps);
}

export function useLayoutEffect(callback: () => void | (() => void), deps?: any[]): void {
  if (!currentRendering) throw new Error('useLayoutEffect must be called within a component render');
  return currentRendering.useLayoutEffect(callback, deps);
}

export function useMemo<T>(factory: () => T, deps: any[]): T {
  if (!currentRendering) throw new Error('useMemo must be called within a component render');
  return currentRendering.useMemo(factory, deps);
}

export function useCallback<T extends Function>(callback: T, deps: any[]): T {
  if (!currentRendering) throw new Error('useCallback must be called within a component render');
  return currentRendering.useCallback(callback, deps);
}

export function useRef<T>(initialValue: T): Ref<T> {
  if (!currentRendering) throw new Error('useRef must be called within a component render');
  return currentRendering.useRef(initialValue);
}

export function useContext<T>(context: Context<T>): T {
  if (!currentRendering) throw new Error('useContext must be called within a component render');
  return getContextValue(currentRendering, context);
}



