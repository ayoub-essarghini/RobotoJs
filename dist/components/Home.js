import { useState } from "../core/core.js";
export class Home {
    constructor(onDataUpdated) {
        this.onDataUpdated = onDataUpdated;
        [this.counter, this.setCounter] = useState(10);
    }
    incrementCounter() {
        console.log("Incrementing counter...");
        this.setCounter(this.counter() + 1);
        this.onDataUpdated(); // Use the callback instead of this.render()
    }
    render() {
        return {
            tag: "div",
            props: { class: "home-container" },
            children: [
                {
                    tag: "p",
                    props: { class: "home-title" },
                    children: [`Counter: `]
                },
                {
                    tag: "span",
                    props: { class: "counter-value" },
                    children: [String(this.counter())] // Display the current counter value
                },
                {
                    tag: "button",
                    props: {
                        class: "increment-btn",
                        onclick: () => this.incrementCounter() // Increment the counter
                    },
                    children: ["Increment"]
                }
            ]
        };
    }
}
