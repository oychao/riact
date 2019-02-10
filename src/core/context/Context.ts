import Component from '../component/Component';
import componentFac from '../component/factory';
import VirtualNode from '../virtualDom/VirtualNode';
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

abstract class Context implements Riact.IContext {
  public static createContext(initialValue: any): IContextComponent {
    class Provider extends Component implements IContextProvider {
      private decendantConsumers: Array<Consumer>;
      private value: any;
      constructor(context: Context, virtualNode: VirtualNode) {
        super(context, virtualNode);
        this.value = virtualNode.attributes.value || initialValue;
        this.decendantConsumers = [];
      }
      public getValue(): any {
        return this.value;
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
        super.renderDom(prevProps);
        this.value = this.virtualNode.attributes.value;
        if (!prevProps || !Object.is(prevProps.value, this.value)) {
          for (const decendantConsumer of this.decendantConsumers) {
            decendantConsumer.renderDom(prevProps);
          }
        }
      }
    };
    
    class Consumer extends Component implements IContextConsumer {
      public ancestorProvider: Provider;
      public unsubscriber: Riact.TFunction;
      constructor(context: Context, virtualNode: VirtualNode) {
        super(context, virtualNode);
        const ancestorNode: VirtualNode = this.virtualNode.findAncestor((node: VirtualNode): boolean => node.el instanceof Provider);
        this.ancestorProvider = ancestorNode ? ancestorNode.el as Component as Provider : null;
        this.unsubscriber = ancestorNode ? this.ancestorProvider.subscribe(this) : null;
      }
      public unmount(): void {
        super.unmount();
        if (this.unsubscriber) {
          this.unsubscriber();
        }
      }
    };
    
    const providerRender: Riact.TFuncComponent = function(): JSX.Element {
      return VirtualNode.createElement(NODE_TYPE_LIST, null, ...(this as Provider).virtualNode.attributes.children as Array<any>);
    };
    (providerRender as Riact.TObject).clazz = Provider;
    
    const consumerRender: Riact.TFuncComponent = function(): JSX.Element {
      const value: any = this.ancestorProvider ? this.ancestorProvider.getValue() : initialValue;
      const vNode: JSX.Element = this.virtualNode.attributes.children[0];
      vNode.attributes = value;
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
  
  constructor() {
    this.componentDeclarationMap = new Map<Riact.TFuncComponent, typeof Component>();
  }
  
  // register component declaration
  private componentDeclarationMap: Map<Riact.TFuncComponent, typeof Component>;
  public getComponent(render: Riact.TFuncComponent): typeof Component {
    if (this.componentDeclarationMap.has(render)) {
      return this.componentDeclarationMap.get(render) ;
    } else {
      const TargetComponent: typeof Component = componentFac(render);
      this.componentDeclarationMap.set(render, TargetComponent);
      return TargetComponent;
    }
  }
  
  // dirty components stack
  private dirtyComponentStack: Array<Component> = [];
  public pushDirtyComponent(comp: Component): void {
    this.dirtyComponentStack.push(comp);
  }
  public popDirtyComponent(): Component {
    return this.dirtyComponentStack.pop();
  }
  public hasDirtyComponent(): boolean {
    return this.dirtyComponentStack.length > 0;
  }
}

export default Context;
