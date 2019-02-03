import * as _ from '../../utils/index';
import Component from './Component';
import VirtualNode from '../VirtualNode';
import Context from '../Context';

const componentFac = function (render: common.TFuncComponent): typeof Component {
  class RenderRelayComponent extends Component {
    public render: common.TFuncComponent;
    constructor(context: Context, virtualNode: VirtualNode) {
      super(context, virtualNode);
    }
  }
  
  _.latentSet(RenderRelayComponent.prototype, 'render', render);
  return RenderRelayComponent;
};

export default componentFac;
