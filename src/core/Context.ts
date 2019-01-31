import Component from '../component/Component';

abstract class Context {
  public abstract getComponent(render: common.TFuncComponent): typeof Component;
}

export default Context;