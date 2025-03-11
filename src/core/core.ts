export function useState<T>(
  initialValue: T | (() => T)
): [() => T, (value: T | ((prevState: T) => T)) => T] {
  let state =
    typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;

  const getter = (): T => state;

  const setter = (newValue: T | ((prevState: T) => T)): T => {
    state =
      typeof newValue === "function"
        ? (newValue as (prevState: T) => T)(state)
        : newValue;
    return state;
  };

  return [getter, setter];
}

// Track hooks state
const componentEffects: Map<
  any,
  Array<{
    cleanup: (() => void) | undefined;
    deps: any[] | undefined;
  }>
> = new Map();

let currentComponent: any = null;
let hookIndex = 0;

// useEffect implementation
export function useEffect(
  effect: () => (() => void) | void,
  deps?: any[]
): void {
  if (!currentComponent) {
    throw new Error("useEffect must be called within a component");
  }

  if (!componentEffects.has(currentComponent)) {
    componentEffects.set(currentComponent, []);
  }

  const effects = componentEffects.get(currentComponent)!;
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
  const depsChanged =
    !deps ||
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
export function runEffects(component: any): void {
  currentComponent = component;
  hookIndex = 0;

  if (!componentEffects.has(component)) {
    componentEffects.set(component, []);
  }
}

// Helper to clean up all effects when component unmounts
export function cleanupEffects(component: any): void {
  if (componentEffects.has(component)) {
    const effects = componentEffects.get(component)!;

    effects.forEach((effect) => {
      if (typeof effect.cleanup === "function") {
        effect.cleanup();
      }
    });

    componentEffects.delete(component);
  }
}
