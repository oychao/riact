import Component from "./component/Component";

interface IStaticContext {
  currentInstance: Component,
  setCurrentInstance(comp: Component): void;
  clearCurrentInstance(): void;
  useState<T>(state: T): [ T, (newState: T) => void ];
}

const StaticContext: IStaticContext = {
  // store currently rendering component instance in global environment
  currentInstance: null,
  setCurrentInstance (comp: Component): void {
    StaticContext.currentInstance = comp;
  },
  clearCurrentInstance(): void {
    StaticContext.currentInstance = null;
  },
  useState<T>(state: T): [ T, (newState: T) => void ] {
    return StaticContext.currentInstance.useStateHook(state);
  }
};

export default StaticContext;
