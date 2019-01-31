import * as _ from '../utils/index';
import Context from '../core/Context';
import VirtualDomMixin from '../core/virtualDom/index';

type TStateHook = Array<any>;
type TEffectHook = (value: any) => void;

export default class Component implements VirtualDomMixin {
  private readonly stateHooks: Array<TStateHook>;
  private readonly effectHooks: Array<TEffectHook>;
  
  private propsPrev: common.TObject;
  private props: common.TObject;
  
  constructor(props: common.TObject) {
    this.stateHooks = [];
    this.effectHooks = [];
    
    this.props = props;
    this.propsPrev = null;
    
    this.virtualDom = this.render(this.props);
    this.rootDom = this.createDomElements(this.virtualDom);
  }
  
  public context: Context;
  public rootDom: HTMLElement;
  public virtualDom: JSX.Element;
  public componentDeclarationMap: Map<common.TFuncComponent, typeof Component>;
  public setContext: (context: Context) => void;
  public getComponent: (render: common.TFuncComponent) => typeof Component
  public createDomElements: (vnode: JSX.Element) => HTMLElement;
  public render: common.TFuncComponent;
}

_.applyMixins(Component, [VirtualDomMixin]);
