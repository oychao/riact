import * as _ from '../../utils/index';
import Context from '../context/Context';
import VirtualNode from '../virtualDom/VirtualNode';
import StaticContext from '../context/StaticContext';

export default class Component implements Riact.IComponent {
  public static memo(funcComp: Riact.TFuncComponent): Riact.TFuncComponent {
    (funcComp as Riact.TObject).clazz = class PureComponent extends Component {
      constructor(context: Context, virtualNode: VirtualNode) {
        super(context, virtualNode);
      }
      
      public shouldComponentUpdate(prevProps: Riact.TObject): boolean {
        const { virtualNode: { attributes: curProps } }: PureComponent = this;
        if (!prevProps) {
          return true;
        }
        for (const key in curProps) {
          if (curProps.hasOwnProperty(key)) {
            if (!prevProps.hasOwnProperty(key) || !Object.is(curProps[key], prevProps[key])) {
              return true;
            }
          }
        }
        return false;
      }
    };
    return funcComp;
  };
  
  private readonly stateHooks: Array<any>;
  private effectHooks: Array<Riact.TFunction>;
  private prevEffectRelativeStates: Array<Array<any>>;
  private currEffectRelativeStates: Array<Array<any>>;
  private initialized: boolean;
  private stateHookIndex: number;
  
  constructor(context: Context, virtualNode: VirtualNode) {
    this.context = context;
    this.stateHooks = [];
    this.effectHooks = [];
    this.prevEffectRelativeStates = [];
    this.currEffectRelativeStates = [];
    this.initialized = false;
    this.virtualNode = virtualNode;
    this.virtualNode.children[0] = VirtualNode.createEmptyNode();
    this.virtualNode.children[0].parentNode = this.virtualNode;
    this.virtualNode.el = this;
  }
  
  protected shouldComponentUpdate(prevProps?: Riact.TObject): boolean {
    return true;
  }

  private callEffectHooks() {
    for (let i = 0; i < this.effectHooks.length; i++) {
      const prevState: Array<any> = this.prevEffectRelativeStates[i];
      const currState: Array<any> = this.currEffectRelativeStates[i];
      const effect: Riact.TFunction = this.effectHooks[i];
      if (!this.initialized || prevState.length !== currState.length || !prevState.length || !_.isEqualArray(currState, prevState)) {
        effect.call(this);
      }
    }
  }
  
  public renderDom(prevProps: Riact.TObject): void {
    if (!this.shouldComponentUpdate(prevProps)) {
      return;
    }
    StaticContext.setCurrentInstance(this);
    this.effectHooks = [];
    this.prevEffectRelativeStates = this.currEffectRelativeStates;
    this.currEffectRelativeStates = [];
    this.stateHookIndex = 0;
    const newVirtualDom: VirtualNode = this.render(this.virtualNode.attributes) as VirtualNode;
    // mount sub virtual dom tree to global virtual dom tree
    newVirtualDom.parentNode = this.virtualNode;
    VirtualNode.diffTree(this.virtualNode.children[0], newVirtualDom);
    this.virtualNode.children[0].reconcile();
    this.callEffectHooks();
    StaticContext.clearCurrentInstance();
    this.initialized = true;
  }
  
  public useStateHook<T>(state: T): [ T, (newState: T) => void ] {
    let stateValue: T = state;
    const { stateHooks, stateHookIndex, initialized }: Component = this;
    if (initialized) {
      stateValue = stateHooks[stateHookIndex];
    } else {
      stateHooks.push(state);
    }
    this.stateHookIndex++;
    return [ stateValue, (newState: T): void => {
      if (_.isNull(this.virtualNode)) {
        return;
      }
      Promise.resolve().then(() => {
        stateHooks[stateHookIndex] = newState;
        this.renderDom(null);
        this.virtualNode.children[0].reconcile();
      });
    } ];
  }
  
  public useEffect(effect: Riact.TFunction, relativeState: Array<any>): void {
    this.effectHooks.push(effect);
    this.currEffectRelativeStates.push(relativeState);
  }
  
  public unmount() {
    this.virtualNode = null;
  }
  
  public virtualNode: VirtualNode;
  public readonly context: Context;
  public readonly render: Riact.TFuncComponent;
  public getContext(): Context {
    return this.context;
  }
}
