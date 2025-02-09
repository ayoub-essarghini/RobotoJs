export type VNode = {
    tag: string;
    props: { [key: string]: any };
    children: Array<VNode | string>
}

export interface Component {
    render(): VNode;
  }
function isVNode(node: VNode | string): node is VNode {
    return typeof node !== "string";
}

export function createElement(tag: string, props: any, ...children: Array<VNode | string>): VNode {
    return { tag, props, children };
}
//render virtual dom to real dom
export function render(vNode: VNode | string): Node {
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

export function patch(parent: Node, newVNode: VNode | string, oldVNode: VNode | string, index = 0) {
    const existingNode = parent.childNodes[index];
  
    if (!existingNode) {
      parent.appendChild(render(newVNode));
    } else if (typeof newVNode === "string" && typeof oldVNode === "string") {
      if (newVNode !== oldVNode) {
        existingNode.textContent = newVNode;
      }
    } else if (isVNode(newVNode) && isVNode(oldVNode)) {
      if (newVNode.tag !== oldVNode.tag) {
        parent.replaceChild(render(newVNode), existingNode);
      } else {
        const newVNodeChildren = newVNode.children;
        const oldVNodeChildren = oldVNode.children;
  
        for (let i = 0; i < newVNodeChildren.length || i < oldVNodeChildren.length; i++) {
          patch(existingNode, newVNodeChildren[i], oldVNodeChildren[i], i);
        }
      }
    }
  }
  
