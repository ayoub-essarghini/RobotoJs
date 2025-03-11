// src/core/react.ts
import { Component } from "../utils/types.js";
import { DOMContext } from "./context.js";

export const React = {
  createElement: (tag: string, props: any = {}, ...children: any[]): any => {
    // Convert children to flat array and handle text nodes
    const flattenArray = (arr: any[]): any[] => {
      return arr.reduce((acc, val) => 
        Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val), []);
    };
    
    const flatChildren = flattenArray(children)
      .map((child: any) => typeof child === 'string' || typeof child === 'number' 
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
  render: (component: Component, container: HTMLElement) => {
    const context = DOMContext.getInstance();
    context.setRoot(container);
    context.mount(component);
  }
};