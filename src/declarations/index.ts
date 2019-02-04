declare namespace common {
  export type TFuncComponent = (props: any) => JSX.Element;
  export type TPatch = {
    action: Symbol,
    payload: JSX.Element | {
      attributes: TObject,
      events: TFuncValObject
    } | {
      index: number,
      item?: JSX.Element
    } | Array<TPatch>
  };
  export type TPatchUpdatePropsPayload = {
    attributes: TObject,
    events: TFuncValObject
  };
  export type TPatchInsertPayload = {
    index: number,
    item: JSX.Element
  };
  export type TPatchRemovePayload = {
    index: number
  };
  export type TPatchTree = {
    [key: string]: TPatch
  };
  export type TObject = {
    [key: string]: any
  };
  export type TStrValObject = {
    [key: string]: string
  };
  export type TFunction = (...args: Array<any>) => any;
  export type TFuncValObject = {
    [key: string]: TFunction
  };
  export type TRef = {
    current: HTMLElement
  };
  export interface IContext {}
  export interface IComponent {
    virtualNode: JSX.Element;
    context: IContext;
    render: common.TFuncComponent;
    getContext(): IContext;
  }
}

declare namespace JSX {
  export interface Element {
    tagType: string | common.TFuncComponent,
    attributes?: common.TObject,
    children?: Array<Element>,
    el?: Node | common.IComponent,
    events?: common.TFuncValObject,
    key?: string,
    nextSibling?: Element,
    parentNode?: Element,
    patch?: common.TPatch;
    ref?: common.TRef;
    reserved?: any,
    value?: any,
  }
}
