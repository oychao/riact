import Component from './component/Component';

abstract class Context {
  public abstract getComponent(render: common.TFuncComponent): typeof Component;
  
  // store currently rendering component instance in global environment
  private static currentInstance: Component;
  public static setCurrentInstance (comp: Component): void {
    Context.currentInstance = comp;
  }
  public static clearCurrentInstance(): void {
    Context.currentInstance = null;
  }
  public static useState<T>(state: T): [ T, (newState: T) => void ] {
    return Context.currentInstance.useStateHook(state);
  }
  
  public static dirtyComponentStack: Array<Component> = [];
  public static pushDirtyComponent(comp: Component): void {
    this.dirtyComponentStack.push(comp);
  }
  public static popDirtyComponent(): Component {
    return this.dirtyComponentStack.pop();
  }
}

export default Context;