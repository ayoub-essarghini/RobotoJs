var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { HttpClient } from "../services/service";
export class Home {
    constructor() {
        this.data = [];
        this.container = document.createElement("div");
        const httpClient = new HttpClient();
        this.fetchData(httpClient);
    }
    fetchData(httpClient) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield httpClient.get("https://jsonplaceholder.typicode.com/posts");
                this.data = response;
                this.render();
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    render() {
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
    innerElement(post) {
        const div = document.createElement("div");
        div.innerHTML = `
        <div>title: ${post.title}</div>
        <p>${post.body}</p>
    `;
        return div;
    }
}
