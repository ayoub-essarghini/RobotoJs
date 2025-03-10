import { useState } from "../core/core";
export class Counter extends Component {
    constructor() {
        super(document.getElementById("app"));
        [this.counter, this.setCounter] = useState(0);
    }
    incrementCounter() {
        this.setCounter(this.counter() + 1);
        this.setState(); // Auto-update UI
    }
    render() {
        return {
            tag: "div",
            props: { class: "counter-container" },
            children: [
                { tag: "p", props: {}, children: [`Counter: ${this.counter()}`] },
                {
                    tag: "button",
                    props: { onclick: () => this.incrementCounter() },
                    children: ["Increment"]
                }
            ]
        };
    }
}
