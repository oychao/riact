declare namespace common {
  export type TFuncComponent = (props: any) => Element;
  export type TPatch = {
    action: 'CREATE' | 'UPDATE' | 'REMOVE',
    payload: {
      attrs: any,
      el?: HTMLElement
    }
  };
  export type TObject = {
    [key: string]: any
  };
  export type TListDiffAction = {
    action: 'INSERT' | 'REMOVE',
    payload: any
  }
}

declare namespace JSX {
  export interface Element {
    tagType: string,
    attributes: any,
    children?: Array<Element>
  }
}
