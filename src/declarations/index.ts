declare namespace common {
  export type TFuncComponent = (props: any) => JSX.Element;
  export type TPatch = {
    action: 'INSERT' | 'REMOVE' | 'UPDATE_PROPS' | 'REPLACE',
    payload: any
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
  export interface IComponent {
    render: common.TFuncComponent;
  }
}

declare namespace JSX {
  export interface Element {
    tagType: string | common.TFuncComponent,
    attributes: any,
    key?: string,
    children?: Array<Element>,
    el?: HTMLElement | common.IComponent,
    parentComp?: common.IComponent,
    parentNode?: Element
  }
}
