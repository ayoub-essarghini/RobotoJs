export function useState(initialValue) {
    let state = typeof initialValue === "function"
        ? initialValue()
        : initialValue;
    const getter = () => state;
    const setter = (newValue) => {
        state =
            typeof newValue === "function"
                ? newValue(state)
                : newValue;
        return state;
    };
    return [getter, setter];
}
// Track hooks state
const componentEffects = new Map();
let currentComponent = null;
let hookIndex = 0;
// useEffect implementation
export function useEffect(effect, deps) {
    if (!currentComponent) {
        throw new Error("useEffect must be called within a component");
    }
    if (!componentEffects.has(currentComponent)) {
        componentEffects.set(currentComponent, []);
    }
    const effects = componentEffects.get(currentComponent);
    const currentHookIndex = hookIndex++;
    // This is a new effect for this component
    if (currentHookIndex >= effects.length) {
        const cleanup = effect();
        effects.push({
            cleanup: typeof cleanup === "function" ? cleanup : undefined,
            deps,
        });
        return;
    }
    const currentEffect = effects[currentHookIndex];
    const oldDeps = currentEffect.deps;
    // Compare dependency arrays
    const depsChanged = !deps ||
        !oldDeps ||
        deps.length !== oldDeps.length ||
        deps.some((dep, i) => dep !== oldDeps[i]);
    // Only run effect if deps have changed
    if (depsChanged) {
        // Run cleanup function if it exists
        if (typeof currentEffect.cleanup === "function") {
            currentEffect.cleanup();
        }
        // Run the new effect and store any returned cleanup
        const cleanup = effect();
        currentEffect.cleanup = typeof cleanup === "function" ? cleanup : undefined;
        currentEffect.deps = deps;
    }
}
// Helper to run all effects for a component
export function runEffects(component) {
    currentComponent = component;
    hookIndex = 0;
    if (!componentEffects.has(component)) {
        componentEffects.set(component, []);
    }
}
// Helper to clean up all effects when component unmounts
export function cleanupEffects(component) {
    if (componentEffects.has(component)) {
        const effects = componentEffects.get(component);
        effects.forEach((effect) => {
            if (typeof effect.cleanup === "function") {
                effect.cleanup();
            }
        });
        componentEffects.delete(component);
    }
}
