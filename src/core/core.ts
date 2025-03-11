// core/core.ts
export function useState<T>(initialValue: T | (() => T)): [() => T, (value: T | ((prevState: T) => T)) => T] {
    let state = typeof initialValue === 'function' 
        ? (initialValue as () => T)() 
        : initialValue;
    
    const getter = (): T => state;
    
    const setter = (newValue: T | ((prevState: T) => T)): T => {
        state = typeof newValue === 'function' 
            ? (newValue as (prevState: T) => T)(state) 
            : newValue;
        return state;
    };
    
    return [getter, setter];
}