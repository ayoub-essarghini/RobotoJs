class MyState<T> {
    private value: T;

    constructor(initialValue: T) {
        this.value = initialValue;
    }

    get(): T {
        return this.value;
    }

    set(newValue: T): void {
        this.value = newValue;
      
    }
}

function useState<T>(initialValue: T): [() => T, (newValue: T) => void] {
    const state = new MyState(initialValue);

    const getState = () => state.get();
    const setState = (newValue: T) => state.set(newValue);

    return [getState, setState];
}

export { useState };