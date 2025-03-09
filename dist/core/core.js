class MyState {
    constructor(initialValue) {
        this.value = initialValue;
    }
    get() {
        return this.value;
    }
    set(newValue) {
        this.value = newValue;
    }
}
function useState(initialValue) {
    const state = new MyState(initialValue);
    const getState = () => state.get();
    const setState = (newValue) => state.set(newValue);
    return [getState, setState];
}
export { useState };
