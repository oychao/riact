type TStateHook = Array<any>;
type TEffectHook = (value: any) => void;

class Component {
  private readonly render: common.TFuncComponent;
  private readonly stateHooks: Array<TStateHook>;
  private readonly effectHooks: Array<TEffectHook>;
  
  private propsPrev: any;
  private props: any;
  private vdom: JSX.Element;
  private parentDomNode: HTMLElement;
  
  constructor(props: any, render: common.TFuncComponent) {
    this.render = render;
    this.stateHooks = [];
    this.effectHooks = [];
    
    this.props = props;
    this.propsPrev = null;
  }
}

export default Component;
