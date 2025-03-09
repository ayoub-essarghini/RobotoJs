import { useState } from "../core/core.js";
export class Home {
    constructor() {
        // Initialize the counter state with useState
        [this.counter, this.setCounter] = useState(10); // Using state for the counter
    }
    // Increment counter function
    incrementCounter() {
        console.log("Incrementing counter...");
        this.setCounter(this.counter() + 1); // Increment the counter
        this.render(); // Manually trigger re-render after state change
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
