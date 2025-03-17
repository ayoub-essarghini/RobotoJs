// Type definitions
type Props = {
  [key: string]: any;
  children?: RobotoElement[];
};

export type RobotoElement = {
  type: string | Function;
  props: Props;
};

type Effect = {
  cleanup?: (() => void) | undefined;
  deps: any[] | undefined;
  callback: () => void | (() => void);
};

type Hook = {
  state: any;
  queue: ((prevState: any) => any)[];
  effect?: Effect;
};

type Fiber = {
  type: string | Function;
  props: Props;
  dom: Node | null;
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  alternate?: Fiber | null;
  effectTag?: "PLACEMENT" | "UPDATE" | "DELETION";
  hooks?: Hook[];
  effects?: Effect[];
};

// Core functions
export function createElement(type: string | Function, props: Props | null, ...children: any[]): RobotoElement {
  return {
    type,
    props: {
      ...(props || {}),
      children: children.map(child =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text: string | number | boolean): RobotoElement {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createDom(fiber: Fiber): Node {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type as string);

  updateDom(dom, {}, fiber.props);

  return dom;
}

const isEvent = (key: string): boolean => key.startsWith("on");
const isProperty = (key: string): boolean => key !== "children" && !isEvent(key);
const isNew = (prev: Props, next: Props) => (key: string): boolean => prev[key] !== next[key];
const isGone = (prev: Props, next: Props) => (key: string): boolean => !(key in next);

function updateDom(dom: Node, prevProps: Props, nextProps: Props): void {
  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      (dom as HTMLElement).removeEventListener(
        eventType,
        prevProps[name]
      );
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      (dom as any)[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      (dom as any)[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      (dom as HTMLElement).addEventListener(
        eventType,
        nextProps[name]
      );
    });
}

function commitRoot(): void {
  deletions!.forEach(commitWork);
  commitWork(wipRoot!.child);
  
  // Run effects after all DOM mutations are complete
  runEffects(wipRoot!);
  
  currentRoot = wipRoot;
  wipRoot = null;
}

function runEffects(fiber: Fiber): void {
  if (!fiber) return;
  
  // Run effect cleanup functions first
  if (fiber.alternate && fiber.alternate.effects) {
    fiber.alternate.effects.forEach(effect => {
      if (effect.cleanup) {
        effect.cleanup();
      }
    });
  }
  
  // Run current effects
  if (fiber.effects) {
    fiber.effects.forEach(effect => {
      // Execute effect callback and store any returned cleanup function
      const cleanup = effect.callback();
      if (typeof cleanup === 'function') {
        effect.cleanup = cleanup;
      }
    });
  }
  
  // Run effects for children
  if (fiber.child) {
    runEffects(fiber.child);
  }
  
  // Run effects for siblings
  if (fiber.sibling) {
    runEffects(fiber.sibling);
  }
}

function commitWork(fiber?: Fiber): void {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent!;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent!;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(
      fiber.dom,
      fiber.alternate!.props,
      fiber.props
    );
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber: Fiber, domParent: Node): void {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child!, domParent);
  }
}

export function render(element: RobotoElement, container: HTMLElement): void {
  wipRoot = {
    type: container.nodeName.toLowerCase(),
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork: Fiber | null = null;
let currentRoot: Fiber | null = null;
let wipRoot: Fiber | null = null;
let deletions: Fiber[] | null = null;

function workLoop(deadline: IdleDeadline): void {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber: Fiber): Fiber | null {
  const isFunctionComponent = typeof fiber.type === "function";
  
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  
  if (fiber.child) {
    return fiber.child;
  }
  
  let nextFiber: Fiber | undefined = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  
  return null;
}

let wipFiber: Fiber | null = null;
let hookIndex: number | null = null;

function updateFunctionComponent(fiber: Fiber): void {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  wipFiber.effects = []; // Initialize effects array
  
  const children = [(fiber.type as Function)(fiber.props)];
  reconcileChildren(fiber, children);
}

export function useState<T>(initial: T): [T, (action: (prevState: T) => T) => void] {
  const oldHook =
    wipFiber!.alternate &&
    wipFiber!.alternate.hooks &&
    wipFiber!.alternate.hooks[hookIndex!];
    
  const hook: Hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    if (typeof action !== 'function') {
      throw new Error('Action must be a function');
    }
    hook.state = action(hook.state);
  });

  const setState = (action: (prevState: T) => T) => {
    if (typeof action !== 'function') {
      throw new Error('Action must be a function');
    }
    hook.queue.push(action);
    wipRoot = {
      type: currentRoot!.type,
      dom: currentRoot!.dom,
      props: currentRoot!.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber!.hooks!.push(hook);
  hookIndex!++;
  return [hook.state, setState];
}


export function useEffect(callback: () => void | (() => void), deps?: any[]): void {
  const oldHook =
    wipFiber?.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex!];

  const hook: Hook = {
    state: oldHook ? oldHook.state : undefined,
    queue: [],
    effect: {
      callback,
      deps,
      cleanup: oldHook?.effect?.cleanup
    }
  };

  // Check if deps have changed
  const hasNoDeps = !deps;
  const hasChangedDeps = oldHook?.effect?.deps
    ? !deps?.every((dep, i) => Object.is(dep, oldHook.effect!.deps![i]))
    : true;

  // Only set effect to run if:
  // 1. No dependency array was provided (runs on every render)
  // 2. Dependency array values have changed since last render
  const shouldRunEffect = hasNoDeps || hasChangedDeps;
  
  if (shouldRunEffect) {
    // Add this effect to be executed after render
    wipFiber!.effects = wipFiber!.effects || [];
    wipFiber!.effects.push(hook.effect!);
  }

  wipFiber!.hooks!.push(hook);
  hookIndex!++;
}

function updateHostComponent(fiber: Fiber): void {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children || []);
}

function reconcileChildren(wipFiber: Fiber, elements: RobotoElement[]): void {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling: Fiber | null = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber: Fiber | null = null;

    const sameType =
      oldFiber &&
      element &&
      element.type === oldFiber.type;

    if (sameType && oldFiber) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }
    
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions!.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber!;
    } else if (element && prevSibling) {
      prevSibling.sibling = newFiber!;
    }

    prevSibling = newFiber;
    index++;
  }
}

// Roboto library export
export const Roboto = {
  createElement,
  render,
  useState,
  useEffect,
};

