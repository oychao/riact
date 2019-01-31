declare namespace common {
  export type TFuncComponent = (props: any) => JSX.Element;
  export type TPatch = {
    action: Symbol,
    payload: number | {
      index: number,
      item: JSX.Child
    } | TStrValObject
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
  export interface IComponent {
    render: common.TFuncComponent;
  }
}

declare namespace JSX {
  export type Child = Element | string;
  export interface Element {
    tagType: string | common.TFuncComponent,
    attributes?: common.TObject,
    key?: string,
    children?: Array<Element | string>,
    el?: HTMLElement | common.IComponent,
    events?: common.TFuncValObject,
    parentComp?: common.IComponent,
    parentNode?: Element,
    patch?: common.TPatch
  }
}
