import Component from '../component/Component';
import componentFac from '../component/factory';

abstract class Context implements common.IContext {

  constructor() {
    this.componentDeclarationMap = new Map<common.TFuncComponent, typeof Component>();
  }
  
  // register component declaration
  private componentDeclarationMap: Map<common.TFuncComponent, typeof Component>;
  public getComponent(render: common.TFuncComponent): typeof Component {
    if (this.componentDeclarationMap.has(render)) {
      return this.componentDeclarationMap.get(render) ;
    } else {
      const TargetComponent: typeof Component = componentFac(render);
      this.componentDeclarationMap.set(render, TargetComponent);
      return TargetComponent;
    }
  }

  // dirty components stack
  private dirtyComponentStack: Array<Component> = [];
  public pushDirtyComponent(comp: Component): void {
    this.dirtyComponentStack.push(comp);
  }
  public popDirtyComponent(): Component {
    return this.dirtyComponentStack.pop();
  }
  public hasDirtyComponent(): boolean {
    return this.dirtyComponentStack.length > 0;
  }
}

export default Context;