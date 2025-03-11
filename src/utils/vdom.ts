export type VNode = {
  tag: string;
  props: { [key: string]: any };
  children: Array<VNode | string>;
};



export function isVNode(node: VNode | string): node is VNode {
  return typeof node !== "string";
}

export function createElement(
  tag: string,
  props: any,
  ...children: Array<VNode | string>
): VNode {
  return { tag, props, children };
}

// Fixed render function to properly handle event listeners
export function render(vNode: VNode | string): Node  | DocumentFragment  {
  if (typeof vNode === "string") {
    return document.createTextNode(vNode);
  }
 // Handle Fragment
 if (vNode.tag === 'fragment') {
  const fragment = document.createDocumentFragment();
  vNode.children.forEach((child) => {
    fragment.appendChild(render(child) as Node);
  });
  return fragment;
}
  const element = document.createElement(vNode.tag);

  // Set attributes and event handlers
  for (const [key, value] of Object.entries(vNode.props || {})) {
    if (key.startsWith("on") && typeof value === "function") {
      // Handle event listeners properly
      const eventName = key.toLowerCase().substring(2);
      element.addEventListener(eventName, value);
    } else if (key === "checked" || key === "value") {
      // Special handling for form elements
      (element as any)[key] = value;
    } else {
      // Regular attributes
      element.setAttribute(key, value);
    }
  }

  // Render children
  vNode.children.forEach((child) => {
    element.appendChild(render(child));
  });

  return element;
}

// Fixed patch function to maintain event listeners
export function patch(
  parent: Node,
  newVNode: VNode | string,
  oldVNode: VNode | string,
  index = 0
): void {
  const existingNode = parent.childNodes[index];

  if (!existingNode) {
    parent.appendChild(render(newVNode));
    return;
  }

  if (typeof newVNode === "string" && typeof oldVNode === "string") {
    if (newVNode !== oldVNode) {
      existingNode.textContent = newVNode;
    }
    return;
  }

  if (!isVNode(newVNode) || !isVNode(oldVNode)) {
    parent.replaceChild(render(newVNode), existingNode);
    return;
  }

  // Both are VNodes from here
  if (newVNode.tag !== oldVNode.tag) {
    parent.replaceChild(render(newVNode), existingNode);
    return;
  }

  // Update props, including event listeners
  for (const [key, value] of Object.entries(newVNode.props || {})) {
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.toLowerCase().substring(2);

      // Remove old event listener if exists
      if (oldVNode.props && typeof oldVNode.props[key] === "function") {
        (existingNode as HTMLElement).removeEventListener(
          eventName,
          oldVNode.props[key]
        );
      }

      // Add new event listener
      (existingNode as HTMLElement).addEventListener(eventName, value);
    } else if (key === "checked" || key === "value") {
      // Special handling for form elements
      (existingNode as any)[key] = value;
    } else if (value !== (oldVNode.props || {})[key]) {
      (existingNode as HTMLElement).setAttribute(key, value);
    }
  }

  // Handle prop removal
  for (const key in oldVNode.props || {}) {
    if (!(key in (newVNode.props || {}))) {
      if (key.startsWith("on")) {
        const eventName = key.toLowerCase().substring(2);
        (existingNode as HTMLElement).removeEventListener(
          eventName,
          oldVNode.props[key]
        );
      } else {
        (existingNode as HTMLElement).removeAttribute(key);
      }
    }
  }

  // Patch children
  const newVNodeChildren = newVNode.children;
  const oldVNodeChildren = oldVNode.children;

  const maxLength = Math.max(newVNodeChildren.length, oldVNodeChildren.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < newVNodeChildren.length && i < oldVNodeChildren.length) {
      patch(existingNode, newVNodeChildren[i], oldVNodeChildren[i], i);
    } else if (i < newVNodeChildren.length) {
      existingNode.appendChild(render(newVNodeChildren[i]));
    } else if (existingNode.childNodes[i]) {
      existingNode.removeChild(existingNode.childNodes[i]);
    }
  }
}
