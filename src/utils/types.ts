import { VNode } from "./vdom";

export interface Component {
    render(): VNode;
  }