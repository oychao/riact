declare namespace common {
  export type TFuncComponent = (props: any) => Element;
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
  export type TLvl1JSON = {
    [key: string]: string
  };
}

declare namespace JSX {
  export interface Element {
    tagType: string,
    attributes: any,
    key?: string
    children?: Array<Element>
  }
}
