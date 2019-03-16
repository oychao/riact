declare namespace Riact {
  export type TFuncComponent = (props: any) => JSX.Element;
  export type TPatch = {
    type: Symbol;
    payload: TPatchPayload;
  };
  export type TPatchPayload =
    | JSX.Element
    | {
        attributes: TObject;
        events: TFuncValObject;
      }
    | {
        index: number;
        item?: JSX.Element;
      }
    | Array<TPatch>
    | Array<JSX.Element>
    | TPatchReorderPayload;
  export type TPatchReorderPayload = {
    removes: Array<JSX.Element>;
    moves: Array<{
      item: JSX.Element;
      to: JSX.Element;
    }>;
    insertions: Map<JSX.Element, Array<JSX.Element>>;
    tailsInss: Array<JSX.Element>;
  };
  export type TPatchUpdatePropsPayload = {
    attributes: TObject;
    events: TFuncValObject;
  };
  export type TPatchInsertPayload = {
    index?: number;
    to?: JSX.Element;
    item: JSX.Element;
  };
  export type TPatchRemovePayload = {
    index?: number;
    item?: JSX.Element;
  };
  export type TPatchTree = {
    [key: string]: TPatch;
  };
  export type TObject = {
    [key: string]: any;
  };
  export type TStrValObject = {
    [key: string]: string;
  };
  export type TFunction = (...args: Array<any>) => any;
  export type TFuncValObject = {
    [key: string]: TFunction;
  };
  export type TRef = {
    current: HTMLElement;
  };
  export interface IAppContext {
    pushDirtyStateComponent(comp: IComponent): void;
    hasDirtyComponent(comp: Riact.IComponent): boolean;
  }
  export interface IComponent {
    virtualNode: JSX.Element;
    appContext: IAppContext;
    render: Riact.TFuncComponent;
    getAppContext(): IAppContext;
    reflectToDom(): void;
    callEffectHooks(): void;
  }
}

declare namespace JSX {
  export interface Element {
    tagType: string | Riact.TFuncComponent;
    attributes?: Riact.TObject;
    children?: Array<Element>;
    el?: Node | Riact.IComponent;
    events?: Riact.TFuncValObject;
    key?: string;
    nextSibling?: Element;
    parentNode?: Element;
    patch?: Riact.TPatch;
    ref?: Riact.TRef;
    reserved?: any;
    value?: any;
  }
}
