import * as _ from '../utils/index';
import { NODE_TYPE_BASIC_VALUE, NODE_TYPE_LIST, NODE_TYPE_EMPTY, NODE_TYPE_ROOT } from "src/constants/index";
import Component from './component/Component';

class VirtualNode implements JSX.Element {
  
  public tagType: string | common.TFuncComponent;
  public attributes?: common.TObject;
  public key?: string;
  public value?: any;
  public children?: Array<VirtualNode>;
  public el?: Node | common.IComponent;
  public events?: common.TFuncValObject;
  public parentNode?: VirtualNode;
  public patch?: common.TPatch;
  public reserved?: any;
  
  constructor() {}
  
  public isRootNode(): boolean {
    return this.tagType === NODE_TYPE_ROOT;
  }
  
  public isEmptyNode(): boolean {
    return this.tagType === NODE_TYPE_EMPTY;
  }
  
  public isComponentNode(): boolean {
    return _.isFunction(this.tagType);
  };
  
  public isBasicValueNode(): boolean {
    return this.tagType === NODE_TYPE_BASIC_VALUE;
  };
  
  public isListNode(): boolean {
    return this.tagType === NODE_TYPE_LIST;
  };
  
  public isDomNode(): boolean {
    return !this.isEmptyNode() && !this.isComponentNode() && !this.isBasicValueNode() && !this.isListNode();
  }
  
  public sameTypeWith(that: VirtualNode): boolean {
    if (!this.isDomNode() && !that.isDomNode()) {
      return this.tagType === that.tagType;
    }
    return true;
  }
  
  public getHTMLDomChildren(): Array<Node> {
    if (this.isDomNode() || this.isBasicValueNode()) {
      return [this.el as Node];
    } else if (this.isEmptyNode()) {
      return [];
    }
    const htmlDoms: Array<Node> = [];
    _.dfsWalk(this, 'children', (child: VirtualNode): boolean => {
      let subNodes: Array<Node> = [];
      if (child.isDomNode() || child.isBasicValueNode()) {
        htmlDoms.push(child.el as Node);
        return false;
      }
      for (let i = 0; i < subNodes.length; i++) {
        htmlDoms.push(subNodes[i]);
      }
      return true;
    });
    return htmlDoms;
  }
  
  public getHTMLParentNode(): Node {
    let ancestor: VirtualNode = this.parentNode;
    while (ancestor && !ancestor.isDomNode()) {
      ancestor = ancestor.parentNode;
    }
    return ancestor.el as Node;
  };

  public mountToDom(): void {
    if (this.isDomNode() || this.isBasicValueNode()) {
      this.getHTMLParentNode().appendChild(this.el as Node);
    }
  }
}

export default VirtualNode;
