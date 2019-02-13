import * as _ from '../../utils/index';
import AppContext from '../context/AppContext';
import { IContextComponent, IContextProvider } from '../context/Context';
import VirtualNode from '../virtualDom/VirtualNode';
import StaticContext from '../context/StaticContext';
import { PROP_CHILDREN } from 'src/constants/index';

export default class Component implements Riact.IComponent {
  public static memo(funcComp: Riact.TFuncComponent): Riact.TFuncComponent {
    (funcComp as Riact.TObject).clazz = class PureComponent extends Component {
      constructor(context: AppContext, virtualNode: VirtualNode) {
        super(context, virtualNode);
      }

      public shouldComponentUpdate(prevProps: Riact.TObject): boolean {
        const {
          virtualNode: { attributes: curProps }
        }: PureComponent = this;
        if (!prevProps) {
          return true;
        }
        for (const key in curProps) {
          if (key === PROP_CHILDREN) {
            continue;
          }
          if (curProps.hasOwnProperty(key)) {
            if (
              !prevProps.hasOwnProperty(key) ||
              !Object.is(curProps[key], prevProps[key])
            ) {
              return true;
            }
          }
        }
        return false;
      }
    };
    return funcComp;
  }

  private readonly stateHooks: Array<any>;
  private readonly contextCompMap: WeakMap<IContextComponent, IContextProvider>;
  private prevEffectHooks: Array<Riact.TFunction>;
  private currEffectHooks: Array<Riact.TFunction>;
  private prevEffectRelativeStates: Array<Array<any>>;
  private currEffectRelativeStates: Array<Array<any>>;
  private effectCleanups: Array<Riact.TFunction>;
  private initialized: boolean;
  private stateHookIndex: number;
  public afterUnmount: Riact.TFunction;

  constructor(context: AppContext, virtualNode: VirtualNode) {
    this.context = context;
    this.stateHooks = [];
    this.contextCompMap = new WeakMap<IContextComponent, IContextProvider>();
    this.currEffectHooks = [];
    this.currEffectRelativeStates = [];
    this.effectCleanups = [];
    this.initialized = false;
    this.virtualNode = virtualNode;
    this.virtualNode.children[0] = VirtualNode.createEmptyNode();
    this.virtualNode.children[0].parentNode = this.virtualNode;
    this.virtualNode.el = this;
  }

  protected shouldComponentUpdate(prevProps?: Riact.TObject): boolean {
    return true;
  }

  private callEffectHooks(): void {
    for (let i = 0; i < this.currEffectHooks.length; i++) {
      const prevState: Array<any> = this.prevEffectRelativeStates[i];
      const currState: Array<any> = this.currEffectRelativeStates[i];
      const effect: Riact.TFunction = this.currEffectHooks[i];
      const prevCleanup: Riact.TFunction = this.effectCleanups[i];
      if (
        !this.initialized ||
        prevState.length !== currState.length ||
        !prevState.length ||
        !_.isEqualArray(currState, prevState)
      ) {
        if (_.isFunction(prevCleanup)) {
          prevCleanup.call(this);
        }
        this.effectCleanups[i] = effect.call(this);
      }
    }
  }

  private callEffectCleanups(): void {
    for (let i = 0; i < this.effectCleanups.length; i++) {
      const callback: Riact.TFunction = this.effectCleanups[i];
      if (_.isFunction(callback)) {
        callback.call(this);
      }
    }
  }

  public getContextCompMap(): WeakMap<IContextComponent, IContextProvider> {
    return this.contextCompMap;
  }

  public renderDom(prevProps: Riact.TObject): void {
    if (!this.shouldComponentUpdate(prevProps)) {
      return;
    }
    // put the rendering procedure into a transaction
    this.context.batchingUpdate(() => {
      StaticContext.setCurrentInstance(this);
      this.prevEffectHooks = this.currEffectHooks;
      this.currEffectHooks = [];
      this.prevEffectRelativeStates = this.currEffectRelativeStates;
      this.currEffectRelativeStates = [];
      this.stateHookIndex = 0;
      const newVirtualDom: VirtualNode = this.render(
        this.virtualNode.attributes
      ) as VirtualNode;
      // mount sub virtual dom tree to global virtual dom tree
      newVirtualDom.parentNode = this.virtualNode;
      VirtualNode.diffTree(this.virtualNode.children[0], newVirtualDom);
      this.virtualNode.children[0].reconcile();
      this.callEffectHooks();
      StaticContext.clearCurrentInstance();
      this.initialized = true;
    }, this);
  }

  public useStateHook<T>(state: T): [T, (newState: T) => void] {
    let stateValue: T = state;
    const { stateHooks, stateHookIndex, initialized }: Component = this;
    if (initialized) {
      stateValue = stateHooks[stateHookIndex];
    } else {
      stateHooks.push(state);
    }
    this.stateHookIndex++;
    return [
      stateValue,
      (newState: T): void => {
        if (_.isNull(this.virtualNode)) {
          return;
        }
        Promise.resolve().then(() => {
          stateHooks[stateHookIndex] = newState;
          this.renderDom(null);
          this.virtualNode.children[0].reconcile();
        });
      }
    ];
  }

  public useEffect(effect: Riact.TFunction, relativeState: Array<any>): void {
    const {
      initialized,
      prevEffectHooks,
      currEffectHooks,
      prevEffectRelativeStates,
      currEffectRelativeStates
    }: Component = this;
    if (
      !_.isEqualArray(
        prevEffectRelativeStates[currEffectRelativeStates.length],
        relativeState
      ) ||
      !relativeState.length ||
      !initialized
    ) {
      currEffectHooks.push(effect);
      currEffectRelativeStates.push(relativeState);
    } else {
      currEffectHooks.push(prevEffectHooks[currEffectHooks.length]);
      currEffectRelativeStates.push(
        prevEffectRelativeStates[currEffectRelativeStates.length]
      );
    }
  }

  public unmount() {
    _.dfsWalk(this.virtualNode, PROP_CHILDREN, (node: VirtualNode) => {
      if (
        node.el &&
        node.el instanceof Component &&
        node !== this.virtualNode
      ) {
        (node.el as Component).unmount();
      }
      return true;
    });
    this.callEffectCleanups();
    this.virtualNode = null;
    if (_.isFunction(this.afterUnmount)) {
      this.afterUnmount();
    }
  }

  public virtualNode: VirtualNode;
  public readonly context: AppContext;
  public readonly render: Riact.TFuncComponent;
  public getContext(): AppContext {
    return this.context;
  }
}
