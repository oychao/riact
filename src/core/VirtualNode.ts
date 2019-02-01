import * as _ from '../utils/index';
import { TAG_TYPE_BASIC_VALUE, TAG_TYPE_LIST, TAG_TYPE_EMPTY } from "src/constants/index";

class VirtualNode implements JSX.Element {
  
  public tagType: string | common.TFuncComponent;
  public attributes?: common.TObject;
  public key?: string;
  public value?: any;
  public children?: Array<VirtualNode>;
  public el?: HTMLElement | common.IComponent;
  public events?: common.TFuncValObject;
  public parentComp?: common.IComponent;
  public parentNode?: VirtualNode;
  public patch?: common.TPatch;
  public reserved?: any;
  
  constructor() {}
  
  public isEmptyNode(): boolean {
    return this.tagType === TAG_TYPE_EMPTY;
  }
  
  public isComponentNode(): boolean {
    return _.isFunction(this.tagType);
  };
  
  public isBasicValueNode(): boolean {
    return this.tagType === TAG_TYPE_BASIC_VALUE;
  };
  
  public isListNode(): boolean {
    return this.tagType === TAG_TYPE_LIST;
  };
}

export default VirtualNode;
