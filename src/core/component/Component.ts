import * as _ from '../../utils/index';
import Context from '../context/Context';
import VirtualNode from '../virtualDom/VirtualNode';
import StaticContext from '../context/StaticContext';

export default class Component implements common.IComponent {
  private readonly stateHooks: Array<any>;
  
  private initialized: boolean;
  private stateHookIndex: number;
  
  constructor(context: Context, virtualNode: VirtualNode) {
    this.context = context;
    this.stateHooks = [];
    this.initialized = false;
    this.virtualNode = virtualNode;
    this.virtualNode.children[0] = VirtualNode.createEmptyNode();
    this.virtualNode.children[0].parentNode = this.virtualNode;
    this.virtualNode.el = this;
    this.update();
    // this.reconcile();
    this.initialized = true;
  }
  
  public update(): void {
    StaticContext.setCurrentInstance(this);
    this.stateHookIndex = 0;
    const newVirtualDom: VirtualNode = this.render(this.virtualNode.attributes) as VirtualNode;
    // mount sub virtual dom tree to global virtual dom tree
    newVirtualDom.parentNode = this.virtualNode;
    VirtualNode.diffTree(this.virtualNode.children[0], newVirtualDom);
    this.virtualNode.children[0].reconcile();
    StaticContext.clearCurrentInstance();
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
      stateHooks[stateHookIndex] = newState;
      this.update();
      this.virtualNode.children[0].reconcile();
    } ];
  }
  
  public virtualNode: VirtualNode;
  public readonly context: Context;
  public readonly render: common.TFuncComponent;
  public getContext(): Context {
    return this.context;
  }
}
