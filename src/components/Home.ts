import { VNode } from "../utils/vdom.js";
import { Component } from "../utils/types.js";


export class Home implements Component {
  render(): VNode {
    return {
      tag: "div",
      props: { class: "home-container" },
      children: [
        {
          tag: "h1",
          props: { class: "home-title" },
          children: ["Home Page"]
        },
        {
          tag: "nav",
          props: { class: "home-nav" },
          children: [
            {
              tag: "a",
              props: {
                href: "/about",
                class: "home-link",
                onclick: "navigate('/about')"
              },
              children: ["About"]
            },
            {
              tag: "a",
              props: {
                href: "/contact",
                class: "home-link",
                onclick: "navigate('/contact')"
              },
              children: ["Contact"]
            }
          ]
        }
      ]
    };
  }
}