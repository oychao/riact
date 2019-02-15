import * as _ from '../../utils/index';

import Component from '../component/Component';
import VirtualNode from '../virtualDom/VirtualNode';
import AppContext from './AppContext';
import { NODE_TYPE_LIST } from 'src/constants/index';

export interface IContextProvider extends Component {
  getValue(): any;
  subscribe(consumer: IContextConsumer): Riact.TFunction;
}
export interface IContextConsumer extends Component {
  ancestorProvider: IContextProvider;
  unsubscriber: Riact.TFunction;
}

export interface IContextComponent {
  initialValue: any;
  Provider: Riact.TFuncComponent;
  Consumer: Riact.TFuncComponent;
}

abstract class Context {
  public static createContext(initialValue: any): IContextComponent {
    class Provider extends Component implements IContextProvider {
      private decendantConsumers: Array<Consumer>;
      constructor(context: AppContext, virtualNode: VirtualNode) {
        super(context, virtualNode);
        this.decendantConsumers = [];
      }
      public getValue(): any {
        const { attributes: { value } }: VirtualNode = this.virtualNode;
        return _.isUndefined(value) ? initialValue : value;
      }
      public subscribe(consumer: Consumer): Riact.TFunction {
        const { decendantConsumers }: Provider = this;
        if (decendantConsumers.indexOf(consumer) === -1) {
          decendantConsumers.push(consumer);
        }
        return (): void => {
          decendantConsumers.splice(decendantConsumers.indexOf(consumer), 1);
        };
      }
      public renderDom(prevProps: Riact.TObject): void {
        this.appContext.batchingUpdate(() => {
          const { attributes: { value } }: VirtualNode = this.virtualNode;
          if (this.isInitialized() && (!prevProps || !Object.is(prevProps.value, value))) {
            for (const decendantConsumer of this.decendantConsumers) {
              decendantConsumer.renderDom(prevProps);
            }
          }
          super.renderDom(prevProps);
        }, this);
      }
    }

    class Consumer extends Component implements IContextConsumer {
      public ancestorProvider: Provider;
      public unsubscriber: Riact.TFunction;
      constructor(context: AppContext, virtualNode: VirtualNode) {
        super(context, virtualNode);
        const ancestorNode: VirtualNode = this.virtualNode.findAncestor(
          (node: VirtualNode): boolean => node.el instanceof Provider
        );
        this.ancestorProvider = ancestorNode
          ? ((ancestorNode.el as Component) as Provider)
          : null;
        this.unsubscriber = ancestorNode
          ? this.ancestorProvider.subscribe(this)
          : null;
      }
      public unmount(): void {
        super.unmount();
        if (this.unsubscriber) {
          this.unsubscriber();
        }
      }
    }

    const providerRender: Riact.TFuncComponent = function(): JSX.Element {
      return VirtualNode.createElement(
        NODE_TYPE_LIST,
        null,
        ...((this as Provider).virtualNode.attributes.children as Array<any>)
      );
    };
    (providerRender as Riact.TObject).clazz = Provider;

    const consumerRender: Riact.TFuncComponent = function(): JSX.Element {
      const vNode: JSX.Element = this.virtualNode.attributes.children[0];
      vNode.attributes = vNode.attributes || {};
      vNode.attributes.value = this.ancestorProvider
        ? this.ancestorProvider.getValue()
        : initialValue;
      return vNode;
    };
    (consumerRender as Riact.TObject).clazz = Consumer;

    const contextComp: IContextComponent = {
      initialValue,
      Provider: providerRender,
      Consumer: consumerRender
    };

    return contextComp;
  }
}

export default Context;
