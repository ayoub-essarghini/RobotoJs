import { h } from "../core/roboto.js";
import { useState, useEffect } from "../core/roboto.js";
// Example Usage
export const Counter = (props) => {
    const [count, setCount] = useState(props.count || 0);
    useEffect(() => {
        console.log('Count changed:', count);
        return () => console.log('Cleanup:', count);
    }, [count]);
    return (h("div", null,
        h("p", { className: "bg-red-500 text" },
            "Count: ",
            count),
        h("button", { onClick: () => setCount(count - 1) }, "-"),
        h("button", { onClick: () => setCount(count + 1) }, "+")));
};
