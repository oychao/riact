import Component from '../component/Component';
import componentFac from '../component/factory';
import VirtualNode from '../virtualDom/VirtualNode';
import { NODE_TYPE_LIST } from 'src/constants/index';

export interface IContextComponent {
  Provider: common.TFuncComponent;
  Consumer: common.TFuncComponent;
}

abstract class Context implements common.IContext {
  public static createContext(initialValue: any): IContextComponent {
    class Provider extends Component {
      private decendantConsumers: Array<Consumer>;
      private value: any;
      constructor(context: Context, virtualNode: VirtualNode) {
        super(context, virtualNode);
          this.value = initialValue;
      }
      public getValue(): any {
        return this.value;
      }
      public subscribe(consumer: Consumer): common.TFunction {
        const { decendantConsumers }: Provider = this;
        decendantConsumers.push(consumer);
        return (): void => {
          const index: number = decendantConsumers.indexOf(consumer);
          decendantConsumers.splice(index, 1);
        };
      }
      public update(prevProps: common.TObject): void {
        super.update(prevProps);
        if (!Object.is(prevProps, this.virtualNode.attributes)) {
          this.decendantConsumers = this.decendantConsumers || [];
          for (const decendantConsumer of this.decendantConsumers) {
            decendantConsumer.update(prevProps);
          }
        }
      }
      public render = (): JSX.Element => {
        return this.virtualNode.attributes.children;
      }
    };
    
    class Consumer extends Component {
      private readonly ancestorProvider: Provider;
      private readonly unsubscriber: common.TFunction;
      constructor(context: Context, virtualNode: VirtualNode) {
        super(context, virtualNode);
        this.ancestorProvider = this.virtualNode.findAncestor((node: VirtualNode): boolean => node instanceof Provider).el as Component as Provider;
        this.unsubscriber = this.ancestorProvider.subscribe(this);
      }
      public unmount(): void {
        super.unmount();
        this.unsubscriber();
      }
    };
    
    const providerRender: common.TFuncComponent = function(): JSX.Element {
      return VirtualNode.createElement(NODE_TYPE_LIST, null, ...(this as Provider).virtualNode.attributes.children as Array<any>);
    };
    (providerRender as common.TObject).clazz = Provider;
    
    const consumerRender: common.TFuncComponent = function(): JSX.Element {
      const value: any = this.ancestorProvider ? this.ancestorProvider.getValue() : initialValue;
      return VirtualNode.createElement(this.virtualNode.attributes.children[0], {
        value
      });
    };
    (consumerRender as common.TObject).clazz = Provider;
    
    
    const contextComp: IContextComponent = {
      Provider: providerRender,
      Consumer: consumerRender
    };
    
    return contextComp;
  }
  
  constructor() {
    this.componentDeclarationMap = new Map<common.TFuncComponent, typeof Component>();
  }
  
  // register component declaration
  private componentDeclarationMap: Map<common.TFuncComponent, typeof Component>;
  public getComponent(render: common.TFuncComponent): typeof Component {
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