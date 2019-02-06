import * as _ from '../../utils/index';
import Component from './Component';
import VirtualNode from '../virtualDom/VirtualNode';
import Context from '../context/Context';

const componentFac = function (render: common.TFuncComponent): typeof Component {
  const ParentComponentDeclaration: typeof Component = (render as common.TObject).clazz || Component;
  class RenderRelayComponent extends ParentComponentDeclaration {
    public render: common.TFuncComponent;
    constructor(context: Context, virtualNode: VirtualNode) {
      super(context, virtualNode);
    }
  }
  
  _.latentSet(RenderRelayComponent.prototype, 'render', render);
  return RenderRelayComponent;
};

export default componentFac;
