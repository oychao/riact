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
}

declare namespace JSX {
  export interface Element {
    tagType: string | common.TFuncComponent,
    attributes: any,
    key?: string
    children?: Array<Element>
  }
}
