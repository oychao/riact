import * as _ from '../../utils/index';

import Component from "../component/Component";

interface IStaticContext {
  currentInstance: Component,
  setCurrentInstance(comp: Component): void;
  clearCurrentInstance(): void;
  useState<T>(state: T): [ T, (newState: T) => void ];
  useEffect(effect: Riact.TFunction, relativeState?: Array<any>): void;
}

const StaticContext: IStaticContext = {
  // store currently rendering component instance in global environment
  currentInstance: null,
  setCurrentInstance (comp: Component): void {
    StaticContext.currentInstance = comp;
  },
  clearCurrentInstance(): void {
    StaticContext.currentInstance = null;
  },
  useState<T>(state: T): [ T, (newState: T) => void ] {
    return StaticContext.currentInstance.useStateHook(state);
  },
  useEffect(effect: Riact.TFunction, relativeState: Array<any> = []): void {
    _.warning(_.isArray(relativeState), 'relative state should be an array');
    return StaticContext.currentInstance.useEffect(effect, relativeState);
  }
};

export default StaticContext;
