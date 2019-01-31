import * as _ from '../utils/index';
import Component from './Component';

const componentFac = function (render: common.TFuncComponent): typeof Component {
  class RenderRelayComponent extends Component {
    public render: common.TFuncComponent;
    constructor(props: common.TObject) {
      super(props);
    }
  }
  
  _.latentSet(RenderRelayComponent.prototype, 'render', render);
  return RenderRelayComponent;
};

export default componentFac;
