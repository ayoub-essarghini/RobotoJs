// src/core/context.ts
import { VNode, patch } from "../utils/vdom.js";

type RenderCallback = () => void;

export class DOMContext {
  private static instance: DOMContext | null = null;
  private activeComponent: any = null;
  private rootNode: HTMLElement | null = null;
  private currentVNode: VNode | null = null;
  private pendingUpdates: Set<any> = new Set();
  private isRenderScheduled: boolean = false;

  private constructor() {}

  public static getInstance(): DOMContext {
    if (!DOMContext.instance) {
      DOMContext.instance = new DOMContext();
    }
    return DOMContext.instance;
  }

  public setRoot(element: HTMLElement): void {
    this.rootNode = element;
  }

  public mount(component: any): void {
    if (!this.rootNode) {
      throw new Error("Root element is not set");
    }

    this.activeComponent = component;
    const vnode = component.render();
    this.currentVNode = vnode;
    patch(this.rootNode, vnode, { tag: "div", props: {}, children: [] });
  }

  public enqueueUpdate(component: any): void {
    if (this.pendingUpdates.size === 0 && !this.isRenderScheduled) {
      this.scheduleUpdate();
    }
    this.pendingUpdates.add(component);
  }

  private scheduleUpdate(): void {
    this.isRenderScheduled = true;
    Promise.resolve().then(() => this.flushUpdates());
  }

  private flushUpdates(): void {
    if (!this.rootNode || !this.currentVNode) return;

    this.pendingUpdates.forEach(component => {
      if (component === this.activeComponent) {
        const newVNode = component.render();
        patch(this.rootNode!, newVNode, this.currentVNode!);
        this.currentVNode = newVNode;
      }
    });

    this.pendingUpdates.clear();
    this.isRenderScheduled = false;
  }
}