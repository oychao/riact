import * as _ from '../../utils/index';
import {
  NODE_TYPE_TEXT,
  NODE_TYPE_LIST,
  NODE_TYPE_EMPTY,
  ACTION_REPLACE,
  ACTION_UPDATE_PROPS,
  ACTION_REORDER,
  ACTION_REMOVE
} from '../../constants/index';
import Component from '../component/Component';
import Context from '../context/Context';
import {
  keyIdxMapFac,
  makeReplaceAction,
  makeUpdatePropsAction,
  makeRemoveAction,
  makeInsertAction
} from './domUtils';

class VirtualNode implements JSX.Element {
  
  public static createEmptyNode(): VirtualNode {
    const node: VirtualNode = new VirtualNode();
    node.el = null;
    node.tagType = NODE_TYPE_EMPTY;
    return node;
  }
  
  private static diffListKeyed(oldList: Array<VirtualNode>, newList: Array<VirtualNode>, key: string): Array<common.TPatch> {
    const actions: Array<common.TPatch> = [];
    
    const oldKeyIdxMap: Map<string, number> = keyIdxMapFac(oldList, key);
    const newKeyIdxMap: Map<string, number> = keyIdxMapFac(newList, key);
    
    const reservedOldList: Array<VirtualNode> = [];
    
    let i;
    let j;
    
    // remove all items which no longer exists in new list
    for (i = 0; i < oldList.length; i++) {
      const item = oldList[i];
      if (newKeyIdxMap.has(item.key)) {
        reservedOldList.push(item);
      } else {
        actions.push(makeRemoveAction(i));
      }
    }
    
    i = 0;
    j = 0;
    while (i < newList.length) {
      const newItem = newList[i];
      const oldItem = reservedOldList[j];
      const nextOldItem = reservedOldList[j + 1];
      
      if (!oldItem || !oldKeyIdxMap.has(newItem.key)) {
        actions.push(makeInsertAction(i++, newItem));
        continue;
      }
      
      if (newItem.key === oldItem.key) {
        j++;
        i++;
      } else {
        if (nextOldItem && nextOldItem.key === newItem.key) {
          actions
          actions.push(makeRemoveAction(i));
          j++;
        } else {
          actions.push(makeInsertAction(i++, oldItem));
        }
      }
    }
    
    while(j < reservedOldList.length) {
      actions.push(makeRemoveAction(j));
      j++;
    }
    
    return actions;
  }
  
  private static diffFreeList (oldList: Array<VirtualNode>, newList: Array<VirtualNode>): Array<common.TPatch> {
    const actions: Array<common.TPatch> = [];
    
    _.warning(oldList.length === newList.length, 'calculating invalid free list difference, length unequaled');
    
    for (let i = 0; i < oldList.length; i++) {
      VirtualNode.diffTree(oldList[i], newList[i]);
    }
    
    return actions;
  }
  
  public static diffTree (oldVDom: VirtualNode, newVDom: VirtualNode): void {
    if (oldVDom.isEmptyNode() && newVDom.isEmptyNode()) {
      return;
    }
    
    if (!oldVDom.sameTypeWith(newVDom) || oldVDom.isEmptyNode() || newVDom.isEmptyNode()) {
      oldVDom.patch = makeReplaceAction(newVDom);
    } else if (oldVDom.isTextNode() && newVDom.isTextNode()) {
      if (oldVDom.value !== newVDom.value) {
        oldVDom.patch = makeReplaceAction(newVDom);
      }
    } else {
      const { tagType: oldTagType, attributes: oldAttributes, children: oldChildren } = oldVDom as VirtualNode;
      const { tagType: newTagType, attributes: newAttributes, children: newChildren } = newVDom as VirtualNode;
      if (oldTagType !== newTagType) {
        oldVDom.patch = makeReplaceAction(newVDom);
        return;
      } else if (!_.isEqualObject(oldAttributes, newAttributes)) {
        oldVDom.patch = makeUpdatePropsAction(newAttributes);
      }
      
      if (!oldVDom.isComponentNode() && !newVDom.isComponentNode()) {
        VirtualNode.diffFreeList(oldChildren, newChildren);
      }
    }
  }
  
  public tagType: string | common.TFuncComponent;
  public attributes?: common.TObject;
  public children?: Array<VirtualNode>;
  public el?: Node | common.IComponent;
  public events?: common.TFuncValObject;
  public index?: number;
  public key?: string;
  public parentNode?: VirtualNode;
  public patch?: common.TPatch;
  public reserved?: any;
  public value?: any;
  
  constructor() {}
  
  public isEmptyNode(): boolean {
    return this.tagType === NODE_TYPE_EMPTY;
  }
  public isTextNode(): boolean {
    return this.tagType === NODE_TYPE_TEXT;
  }
  public isListNode(): boolean {
    return this.tagType === NODE_TYPE_LIST;
  }
  public isComponentNode(): boolean {
    return _.isFunction(this.tagType);
  }
  public isTaggedDomNode(): boolean {
    return !this.isEmptyNode() && !this.isComponentNode() && !this.isTextNode() && !this.isListNode();
  }
  
  public sameTypeWith(that: VirtualNode): boolean {
    if (!this.isTaggedDomNode() && !that.isTaggedDomNode()) {
      return this.tagType === that.tagType;
    }
    return true;
  }
  
  public getDomParentNode(): Node {
    let ancestor: VirtualNode = this.parentNode;
    while (ancestor && !ancestor.isTaggedDomNode()) {
      ancestor = ancestor.parentNode;
    }
    return ancestor.el as Node;
  }
  
  public getParentCompNode(): Component {
    let ancestor: VirtualNode = this.parentNode;
    while (ancestor && !ancestor.isComponentNode()) {
      ancestor = ancestor.parentNode;
    }
    return ancestor.el as Component;
  }
  
  public getDomChildren(): Array<Node> {
    if (this.isTaggedDomNode() || this.isTextNode()) {
      return [this.el as Node];
    } else if (this.isEmptyNode()) {
      return [];
    }
    const htmlDoms: Array<Node> = [];
    _.dfsWalk(this, 'children', (child: VirtualNode): boolean => {
      let subNodes: Array<Node> = [];
      if (child.isTaggedDomNode() || child.isTextNode()) {
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
  
  public getNextSibling(): VirtualNode {
    const { parentNode }: VirtualNode = this;
    return parentNode.children && _.isArray(parentNode.children) ? parentNode.children[this.index + 1] : null;
  }
  public getMostLeftDomNodeInSubTree(): VirtualNode {
    const { children }: VirtualNode = this;
    if (!_.isArray(children) || !children.length) {
      return null;
    }
    for (const child of children) {
      if (child.isComponentNode()) {
        return child.getMostLeftDomNodeInSubTree();
      } else if (child.isTaggedDomNode() || child.isTextNode()) {
        return child;
      } else {
        return null;
      }
    }
  }
  public getNextDomSibling(): Node {
    let targetNode: VirtualNode = null;
    let currentNode: VirtualNode = this;
    do {
      const nextSibling: VirtualNode = currentNode.getNextSibling();
      if (nextSibling) {
        if (nextSibling.isTaggedDomNode() || nextSibling.isTextNode()) {
          targetNode = nextSibling;
          break;
        }
        targetNode = nextSibling.getMostLeftDomNodeInSubTree();
        if (targetNode) {
          break;
        }
      }
      currentNode = currentNode.parentNode;
    } while (!currentNode.isTaggedDomNode())
    return targetNode && targetNode.el as Node;
  }
  
  public renderDom(): VirtualNode {
    let node: Text | HTMLElement | Component = null;
    
    const { tagType, attributes, children } = this;
    if (this.isComponentNode()) {
      const compRender: common.TFuncComponent = (tagType as common.TFuncComponent);
      const context: Context = this.getParentCompNode().getContext();
      const TargetComponent: typeof Component = context.getComponent(compRender);
      this.attributes.children = children;
      this.children = [];
      node = new TargetComponent(context, this);
      return this;
    } else if (this.isTextNode()) {
      node = document.createTextNode(this.value) as Text;
    } else if (this.isEmptyNode()) {
      return this;
    } else if (this.isTaggedDomNode()) {
      node = document.createElement(this.tagType as string);
      for (const key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          const value = attributes[key];
          node.setAttribute(key, value);
        }
      }
    }
    this.el = node;
    this.mountToDom();
    
    return this;
  }
  
  public mountToDom(): void {
    if (this.isTaggedDomNode() || this.isTextNode()) {
      const nextDomSibling: Node = this.getNextDomSibling();
      if (nextDomSibling) {
        this.getDomParentNode().insertBefore(this.el as Node, nextDomSibling);
      } else {
        this.getDomParentNode().appendChild(this.el as Node);
      }
    }
  }
  
  public unmountFromDom(): void {
    if (this.isTaggedDomNode() || this.isTextNode()) {
      this.getDomParentNode().removeChild(this.el as Node);
    } else if (this.isComponentNode()) {
      const domChildren: Array<Node> = this.getDomChildren();
      for (const domChild of domChildren) {
        domChild.parentNode.removeChild(domChild);
      }
    }
  }
  
  public reconcile(): void {
    _.dfsWalk(this, 'children', (node: VirtualNode): boolean => {
      if (!node.patch) {
        return true;
      }
      const { action, payload }: common.TPatch = node.patch;
      if (action === ACTION_REPLACE) {
        node.unmountFromDom();
        node.loadData(payload as VirtualNode);
        node.renderDom();
        delete node.patch;
        if (!node.isComponentNode() && _.isArray(node.children)) {
          for (const child of node.children) {
            _.dfsWalk(child, 'children', (offspring: VirtualNode): boolean => {
              offspring.renderDom();
              return true;
            });
          }
        }
        return false;
      } else if (action === ACTION_UPDATE_PROPS) {
      } else if (action === ACTION_REORDER) {
      } else if (action === ACTION_REMOVE) {
      }
      delete node.patch;
      return true;
    });
  }
  
  public loadData(that: VirtualNode): void {
    this.tagType = that.tagType;
    this.attributes = that.attributes;
    this.children = that.children;
    this.events = that.events;
    if (_.isArray(this.children)) {
      for (const child of this.children) {
        child.parentNode = this;
      }
    }
    if (that.reserved) {
      this.reserved = that.reserved;
    } else {
      delete this.reserved;
    }
    if (that.value) {
      this.value = that.value;
    } else {
      delete this.value;
    }
    delete this.el;
  }
}

export default VirtualNode;
