import Component from '../component/Component';
import componentFac from '../component/factory';

abstract class AppContext implements Riact.IAppContext {
  constructor() {
    this.componentDeclarationMap = new Map<
      Riact.TFuncComponent,
      typeof Component
    >();
  }

  // register component declaration
  private componentDeclarationMap: Map<Riact.TFuncComponent, typeof Component>;
  public getComponent(render: Riact.TFuncComponent): typeof Component {
    if (this.componentDeclarationMap.has(render)) {
      return this.componentDeclarationMap.get(render);
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

export default AppContext;
