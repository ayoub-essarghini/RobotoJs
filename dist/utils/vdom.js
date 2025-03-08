function isVNode(node) {
    return typeof node !== "string";
}
export function createElement(tag, props, ...children) {
    return { tag, props, children };
}
//render virtual dom to real dom
export function render(vNode) {
    if (typeof vNode === "string") {
        return document.createTextNode(vNode);
    }
    const element = document.createElement(vNode.tag);
    // Set attributes
    for (const [key, value] of Object.entries(vNode.props || {})) {
        element.setAttribute(key, value);
    }
    // Render children
    vNode.children.forEach((child) => {
        element.appendChild(render(child));
    });
    return element;
}
export function patch(parent, newVNode, oldVNode, index = 0) {
    const existingNode = parent.childNodes[index];
    if (!existingNode) {
        parent.appendChild(render(newVNode));
    }
    else if (typeof newVNode === "string" && typeof oldVNode === "string") {
        if (newVNode !== oldVNode) {
            existingNode.textContent = newVNode;
        }
    }
    else if (isVNode(newVNode) && isVNode(oldVNode)) {
        if (newVNode.tag !== oldVNode.tag) {
            parent.replaceChild(render(newVNode), existingNode);
        }
        else {
            const newVNodeChildren = newVNode.children;
            const oldVNodeChildren = oldVNode.children;
            for (let i = 0; i < newVNodeChildren.length || i < oldVNodeChildren.length; i++) {
                patch(existingNode, newVNodeChildren[i], oldVNodeChildren[i], i);
            }
        }
    }
}
