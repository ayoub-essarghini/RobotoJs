import { HttpClient } from "../services/HttpClient";

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export class Home {
  data: Post[] = [];
  container: HTMLElement;

  constructor() {
    this.container = document.createElement("div"); 
    const httpClient = new HttpClient();
    this.fetchData(httpClient);
  }


  async fetchData(httpClient: HttpClient) {
    try {
      const response = await httpClient.get("https://jsonplaceholder.typicode.com/posts");
      this.data = response;
     
      this.render(); 
    } catch (err) {
      console.error(err);
    }
  }


  render(): string {
    console.log("start rendering...");
    this.container.innerHTML = '';

    if (this.data.length === 0) {
      return this.container.innerHTML = "<div>Loading...</div>";
     
    }


   
    for (let post of this.data) {
      this.container.append(this.innerElement(post));
      const hr = document.createElement("hr");
      this.container.append(hr);
    }



    // console.log("here", this.container.outerHTML);
    document.body.appendChild(this.container); 
    return this.container.outerHTML;
  }

  innerElement(post: Post): HTMLElement {
    const div = document.createElement("div");
    div.innerHTML = `
        <div>title: ${post.title}</div>
        <p>${post.body}</p>
    `;
    return div;
  }
}
