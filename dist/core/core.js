// core/core.ts
export function useState(initialValue) {
    let state = typeof initialValue === 'function'
        ? initialValue()
        : initialValue;
    const getter = () => state;
    const setter = (newValue) => {
        state = typeof newValue === 'function'
            ? newValue(state)
            : newValue;
        return state;
    };
    return [getter, setter];
}
