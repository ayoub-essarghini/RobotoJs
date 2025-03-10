import { VNode } from "./vdom.js";


export interface Component {
    render(): VNode;
}