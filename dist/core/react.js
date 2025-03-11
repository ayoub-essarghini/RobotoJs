import { DOMContext } from "./context.js";
export const React = {
    createElement: (tag, props = {}, ...children) => {
        // Convert children to flat array and handle text nodes
        const flattenArray = (arr) => {
            return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val), []);
        };
        const flatChildren = flattenArray(children)
            .map((child) => typeof child === 'string' || typeof child === 'number'
            ? String(child)
            : child);
        return {
            tag,
            props: props || {},
            children: flatChildren
        };
    }
};
export const ReactDOM = {
    render: (component, container) => {
        const context = DOMContext.getInstance();
        context.setRoot(container);
        context.mount(component);
    }
};
