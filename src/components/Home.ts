import { createElement, VNode } from "../utils/vdom";
import { HttpClient } from "../services/service";
import { Component } from "../utils/types";

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export class Home implements Component {
  data: Post[] = [];
  isLoading: boolean = true;
  private onDataUpdated: () => void;

  constructor(onDataUpdated: () => void) {
    this.onDataUpdated = onDataUpdated;
    const httpClient = new HttpClient();
    this.fetchData(httpClient);
  }

  async fetchData(httpClient: HttpClient) {
    try {
      const res = await httpClient.get("https://jsonplaceholder.typicode.com/posts");
      this.data = res;
      this.isLoading = false;
      this.onDataUpdated(); // Trigger re-render after data is fetched
    } catch (err) {
      console.error(err);
      this.isLoading = false;
      this.onDataUpdated(); // Trigger re-render even if there's an error
    }
  }

  render(): VNode {
    if (this.isLoading) {
      return createElement("div", {}, "Loading...");
    }

    const children = this.data.map(post => this.createPostVNode(post));
    return createElement("div", {}, ...children);
  }

  createPostVNode(post: Post): VNode {
    return createElement("div", {},
      createElement("div", {}, `Title: ${post.title}`),
      createElement("p", {}, post.body),
      createElement("hr", {})
    );
  }
}