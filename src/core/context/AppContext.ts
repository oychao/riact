import Component from '../component/Component';
import componentFac from '../component/factory';

type TransactionWrapper = {
  before: Riact.TFunction;
  after: Riact.TFunction;
};

abstract class AppContext implements Riact.IAppContext {
  constructor() {
    this.componentDeclarationMap = new WeakMap<
      Riact.TFuncComponent,
      typeof Component
    >();
    this.performing = false;
    this.wrappers = [
      AppContext.BATCHING_UPDATE_STRATEGY,
      AppContext.BATCH_INVOKE_EFFECTS_STRATEGY
    ];
    this.dirtyStateComponentStack = [];
    this.dirtyStateComponentMap = new WeakMap<Component, boolean>();
    this.dirtyEffectComponentStack = [];
    this.dirtyEffectComponentMap = new WeakMap<Component, boolean>();
  }

  /**
   * register component declaration
   */
  private componentDeclarationMap: WeakMap<
    Riact.TFuncComponent,
    typeof Component
  >;
  public getComponent(render: Riact.TFuncComponent): typeof Component {
    if (this.componentDeclarationMap.has(render)) {
      return this.componentDeclarationMap.get(render);
    } else {
      const TargetComponent: typeof Component = componentFac(render);
      this.componentDeclarationMap.set(render, TargetComponent);
      return TargetComponent;
    }
  }

  /**
   * transaction and batching update strategy
   */
  private performing: boolean;
  private readonly wrappers: Array<TransactionWrapper>;
  public perform(
    callback: Riact.TFunction,
    scope: any,
    ...args: Array<any>
  ): void {
    this.performing = true;
    this.beforeAll();
    callback.apply(scope, args);
    this.afterAll();
    this.performing = false;
  }
  private beforeAll(): void {
    for (const wrapper of this.wrappers) {
      wrapper.before.call(this);
    }
  }
  private afterAll(): void {
    for (const wrapper of this.wrappers) {
      wrapper.after.call(this);
    }
  }
  public batchingUpdate(
    callback: Riact.TFunction,
    scope: Riact.TObject,
    ...args: Array<any>
  ): any {
    const { performing }: AppContext = this;
    this.performing = true;
    if (performing) {
      return callback.apply(scope, args);
    } else {
      this.perform(callback, scope, args);
    }
  }
  private static BATCHING_UPDATE_STRATEGY: TransactionWrapper = {
    before() {},
    after() {
      // batching update state
      let comp: Component = this.dirtyStateComponentStack.pop();
      while (comp) {
        comp.reflectToDom();
        comp = this.dirtyStateComponentStack.pop();
      }
      this.dirtyStateComponentMap = new WeakMap<Component, boolean>();
    }
  };
  private static BATCH_INVOKE_EFFECTS_STRATEGY: TransactionWrapper = {
    before() {},
    after() {
      // batching invoke effect
      let comp: Component = this.dirtyEffectComponentStack.pop();
      while (comp) {
        comp.callEffectHooks();
        comp = this.dirtyEffectComponentStack.pop();
      }
      this.dirtyEffectComponentMap = new WeakMap<Component, boolean>();
    }
  };

  /**
   * dirty components stack
   */
  private dirtyStateComponentStack: Array<Component>;
  private dirtyStateComponentMap: WeakMap<Component, boolean>;
  public pushDirtyStateComponent(comp: Riact.IComponent): void {
    if (!this.dirtyStateComponentMap.has(comp as Component)) {
      this.dirtyStateComponentStack.push(comp as Component);
      this.dirtyStateComponentMap.set(comp as Component, true);
    }
  }
  public hasDirtyComponent(comp: Riact.IComponent): boolean {
    return this.dirtyEffectComponentMap.get(comp as Component);
  }
  private dirtyEffectComponentStack: Array<Component>;
  private dirtyEffectComponentMap: WeakMap<Component, boolean>;
  public pushDirtyEffectComponent(comp: Riact.IComponent): void {
    if (!this.dirtyEffectComponentMap.has(comp as Component)) {
      this.dirtyEffectComponentStack.push(comp as Component);
      this.dirtyEffectComponentMap.set(comp as Component, true);
    }
  }
}

export default AppContext;
