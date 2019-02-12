import * as _ from '../../utils/index';

import Component from '../component/Component';
import VirtualNode from '../virtualDom/VirtualNode';
import {
  IContextComponent,
  IContextConsumer,
  IContextProvider
} from './Context';

interface IStaticContext {
  currentInstance: IContextConsumer;
  setCurrentInstance(comp: Component): void;
  clearCurrentInstance(): void;
  useState<T>(state: T): [T, (newState: T) => void];
  useEffect(effect: Riact.TFunction, relativeState?: Array<any>): void;
  useContext(contextComp: IContextComponent): any;
}

const StaticContext: IStaticContext = {
  // store currently rendering component instance in global environment
  currentInstance: null,
  setCurrentInstance(comp: Component): void {
    StaticContext.currentInstance = comp as IContextConsumer;
  },
  clearCurrentInstance(): void {
    StaticContext.currentInstance = null;
  },
  useState<T>(state: T): [T, (newState: T) => void] {
    return (StaticContext.currentInstance as Component).useStateHook(state);
  },
  useEffect(effect: Riact.TFunction, relativeState: Array<any> = []): void {
    _.warning(_.isArray(relativeState), 'relative state should be an array');
    return StaticContext.currentInstance.useEffect(effect, relativeState);
  },
  useContext(contextComp: IContextComponent): any {
    const instance: IContextConsumer = StaticContext.currentInstance;
    const ancestorNode: VirtualNode = instance.virtualNode.findAncestor(
      (node: VirtualNode): boolean => {
        return (
          node.el && (node.el as Component).render === contextComp.Provider
        );
      }
    );
    const contextCompMap: WeakMap<
      IContextComponent,
      IContextProvider
    > = instance.getContextCompMap();
    if (contextCompMap.has(contextComp)) {
      return contextCompMap.get(contextComp).getValue();
    } else {
      instance.ancestorProvider = ancestorNode
        ? ((ancestorNode.el as Component) as IContextProvider)
        : null;
      instance.unsubscriber = ancestorNode
        ? instance.ancestorProvider.subscribe(instance)
        : null;
      instance.afterUnmount = () => {
        if (instance.unsubscriber) {
          instance.unsubscriber();
        }
      };
      if (!instance.ancestorProvider) {
        return contextComp.initialValue;
      } else {
        contextCompMap.set(contextComp, instance.ancestorProvider);
        return instance.ancestorProvider.getValue();
      }
    }
  }
};

export default StaticContext;
