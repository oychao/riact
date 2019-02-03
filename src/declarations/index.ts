declare namespace common {
  export type TFuncComponent = (props: any) => JSX.Element;
  export type TPatch = {
    action: Symbol,
    payload: number | TStrValObject | JSX.Element | {
      index: number,
      item: JSX.Element
    }
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
    parentNode?: Element,
    patch?: common.TPatch,
    reserved?: any,
    value?: any,
  }
}
