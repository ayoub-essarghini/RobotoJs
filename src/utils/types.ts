import { VNode } from "./vdom.js";


export interface Component {
    render(): VNode;

    // Optional lifecycle methods
    onMount?(): void;
    onUpdate?(): void;
    onUnmount?(): void;

    // Optional props
    props?: Record<string, any>;

    // Optional state
    state?: Record<string, any>;

    // Optional methods
    [key: string]: any;

    // Optional children
    children?: Component[];

    // Optional parent

    parent?: Component;

    // Optional key

    key?: string;

    // Optional ref

    ref?: HTMLElement;
}

export type FComponent<P = {}> = (props: P) => VNode;