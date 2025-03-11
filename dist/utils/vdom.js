export function isVNode(node) {
    return typeof node !== "string";
}
export function createElement(tag, props, ...children) {
    return { tag, props, children };
}
// Fixed render function to properly handle event listeners
export function render(vNode) {
    if (typeof vNode === "string") {
        return document.createTextNode(vNode);
    }
    // Handle Fragment
    if (vNode.tag === 'fragment') {
        const fragment = document.createDocumentFragment();
        vNode.children.forEach((child) => {
            fragment.appendChild(render(child));
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
        }
        else if (key === "checked" || key === "value") {
            // Special handling for form elements
            element[key] = value;
        }
        else {
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
export function patch(parent, newVNode, oldVNode, index = 0) {
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
                existingNode.removeEventListener(eventName, oldVNode.props[key]);
            }
            // Add new event listener
            existingNode.addEventListener(eventName, value);
        }
        else if (key === "checked" || key === "value") {
            // Special handling for form elements
            existingNode[key] = value;
        }
        else if (value !== (oldVNode.props || {})[key]) {
            existingNode.setAttribute(key, value);
        }
    }
    // Handle prop removal
    for (const key in oldVNode.props || {}) {
        if (!(key in (newVNode.props || {}))) {
            if (key.startsWith("on")) {
                const eventName = key.toLowerCase().substring(2);
                existingNode.removeEventListener(eventName, oldVNode.props[key]);
            }
            else {
                existingNode.removeAttribute(key);
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
        }
        else if (i < newVNodeChildren.length) {
            existingNode.appendChild(render(newVNodeChildren[i]));
        }
        else if (existingNode.childNodes[i]) {
            existingNode.removeChild(existingNode.childNodes[i]);
        }
    }
}
