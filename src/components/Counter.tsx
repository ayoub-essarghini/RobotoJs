import { h, VNode } from "../core/roboto.js";
import { useState, useEffect } from "../core/roboto.js";

// Example Usage
export const Counter = (props:any)=> {
  const [count, setCount] = useState(props.count || 0);
  
  useEffect(() => {
    console.log('Count changed:', count);
    return () => console.log('Cleanup:', count);
  }, [count]);

  return (
    <div>
      <p className="bg-red-500 text">Count: {count}</p>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}

