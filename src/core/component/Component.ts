import * as _ from '../../utils/index';
import Context from '../../core/Context';
import VirtualDomMixin from '../../core/virtualDom/index';
import VirtualNode from '../VirtualNode';

export default class Component implements VirtualDomMixin {
  private readonly stateHooks: Array<any>;
  private initialized: boolean;
  private stateHookIndex: number;
  private props: common.TObject;
  
  constructor(props: common.TObject, stateNode: VirtualNode) {
    this.stateHooks = [];
    this.initialized = false;
    this.stateNode = stateNode;
    this.props = props;
    
    this.update();
    this.initialized = true;
  }
  
  public update(): void {
    Context.setCurrentInstance(this);
    this.stateHookIndex = 0;
    this.virtualDom = this.render(this.props) as VirtualNode;
    // mount sub virtual dom tree to global virtual dom tree
    this.virtualDom.parentNode = this.stateNode;
    this.stateNode.children.push(this.virtualDom);
    Context.clearCurrentInstance();
  }
  
  public useStateHook<T>(state: T): [ T, (newState: T) => void ] {
    let stateValue: T = state;
    const { stateHooks, stateHookIndex, initialized }: Component = this;
    if (!initialized) {
      stateHooks.push(state);
    } else {
      stateValue = stateHooks[stateHookIndex];
    }
    return [ stateValue, (newState: T): void => {
      stateHooks[this.stateHookIndex++] = newState;
    } ];
  }
  
  public context: Context;
  public readonly stateNode: VirtualNode;
  public virtualDom: VirtualNode;
  public componentDeclarationMap: Map<common.TFuncComponent, typeof Component>;
  public render: common.TFuncComponent;
  public setContext: (context: Context) => void;
  public setStateNode: (stateNode: VirtualNode) => void;
  public getComponent: (render: common.TFuncComponent) => typeof Component
  public renderDomElements: (domRoot: VirtualNode, vnode: VirtualNode) => VirtualNode;
  public diffListKeyed: (oldList: Array<VirtualNode>, newList: Array<VirtualNode>, key: string) => Array<common.TPatch>;
  public diffFreeList: (oldList: Array<VirtualNode>, newList: Array<VirtualNode>) => Array<common.TPatch>;
  public diffTree: (newVDom: VirtualNode) => common.TPatch;
  public reconcile: () => void;
}

_.applyMixins(Component, [VirtualDomMixin]);
