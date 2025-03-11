import { VNode } from "../utils/vdom.js";
import { Component } from "../utils/types.js";

export class NotFound implements Component {
  private onDataUpdated: () => void;

  constructor(onDataUpdated: () => void) {
    this.onDataUpdated = onDataUpdated;
  }

  render(): VNode {
    return {
      tag: "div",
      props: { class: "container mx-auto p-4 text-center" },
      children: [
        {
          tag: "h1",
          props: { class: "text-4xl font-bold text-red-500 mb-4" },
          children: ["404"]
        },
        {
          tag: "p",
          props: { class: "text-xl mb-6" },
          children: ["Page Not Found"]
        },
        {
          tag: "a",
          props: { 
            href: "/",
            class: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
          },
          children: ["Return to Home"]
        }
      ]
    };
  }
}