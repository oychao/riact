import * as _ from '../../utils/index';
import Component from './Component';
import VirtualNode from '../virtualDom/VirtualNode';
import AppContext from '../context/AppContext';

const componentFac = function(render: Riact.TFuncComponent): typeof Component {
  const ParentComponentDeclaration: typeof Component =
    (render as Riact.TObject).clazz || Component;
  class RenderRelayComponent extends ParentComponentDeclaration {
    public render: Riact.TFuncComponent;
    constructor(context: AppContext, virtualNode: VirtualNode) {
      super(context, virtualNode);
    }
  }

  _.latentSet(RenderRelayComponent.prototype, 'render', render);
  return RenderRelayComponent;
};

export default componentFac;
