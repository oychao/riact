import * as _ from '../../utils/index';
import Component from './Component';
import VirtualNode from '../VirtualNode';

const componentFac = function (render: common.TFuncComponent): typeof Component {
  class RenderRelayComponent extends Component {
    public render: common.TFuncComponent;
    constructor(props: common.TObject, stateNode: VirtualNode) {
      super(props, stateNode);
    }
  }
  
  _.latentSet(RenderRelayComponent.prototype, 'render', render);
  return RenderRelayComponent;
};

export default componentFac;
