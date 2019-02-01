import * as _ from '../../utils/index';
import Context from '../../core/Context';
import VirtualDomMixin from '../../core/virtualDom/index';
import VirtualNode from '../VirtualNode';

export default class Component implements VirtualDomMixin {
  private readonly stateHooks: Array<any>;
  private initialized: boolean;
  private stateHookIndex: number;
  private props: common.TObject;
  
  constructor(props: common.TObject) {
    this.stateHooks = [];
    this.initialized = false;
    this.props = props;
    
    this.update();
    this.initialized = true;
  }
  
  public update(): void {
    Context.setCurrentInstance(this);
    this.stateHookIndex = 0;
    this.virtualDom = this.render(this.props) as VirtualNode;
    this.rootDom = this.createDomElements(this.virtualDom);
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
  public rootDom: HTMLElement;
  public virtualDom: VirtualNode;
  public componentDeclarationMap: Map<common.TFuncComponent, typeof Component>;
  public render: common.TFuncComponent;
  public setContext: (context: Context) => void;
  public getComponent: (render: common.TFuncComponent) => typeof Component
  public createDomElements: (vnode: VirtualNode) => HTMLElement;
  public diffListKeyed: (oldList: Array<VirtualNode>, newList: Array<VirtualNode>, key: string) => Array<common.TPatch>;
  public diffFreeList: (oldList: Array<VirtualNode>, newList: Array<VirtualNode>) => Array<common.TPatch>;
  public treeDiff: (newVDom: VirtualNode) => common.TPatch;
  public reconcile: () => void;
}

_.applyMixins(Component, [VirtualDomMixin]);
