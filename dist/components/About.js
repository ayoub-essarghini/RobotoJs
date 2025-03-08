import { createElement } from "../utils/vdom.js";
export class About {
    render() {
        return createElement("button", { class: "bg-indigo-500 hover:bg-fuchsia-500" }, "About Page");
    }
}
