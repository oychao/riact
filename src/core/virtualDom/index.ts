import * as _ from '../../utils/index';
import {
  keyIdxMapFac,
  makeRemoveAction,
  makeInsertAction,
  makeReplaceAction,
  makeUpdatePropsAction,
  flatternListNode
} from './domUtils';
import { ACTION_REPLACE, ACTION_UPDATE_PROPS, ACTION_INSERT, ACTION_REORDER } from '../../constants/index';
import Context from '../../core/Context';
import Component from '../component/component';
import VirtualNode from '../VirtualNode';

export default class VirtualDomMixin implements common.IComponent {
  public context: Context;
  public stateNode: VirtualNode;
  public virtualDom: VirtualNode;
  
  public setContext(context: Context): void {
    this.context = context;
  }
  
  public setStateNode(stateNode: VirtualNode): void {
    this.stateNode = stateNode;
  }
  
  public renderDomElements(vRoot: VirtualNode, vNode: VirtualNode): VirtualNode {
    let node: Text | HTMLElement | Component = null;
    
    if (_.isNull(vNode)) {
      return null;
    }
    
    vNode.parentNode = vRoot;
    
    const { tagType, attributes, children } = vNode;
    if (vNode.isComponentNode()) {
      const compRender: common.TFuncComponent = (tagType as common.TFuncComponent);
      const TargetComponent: typeof Component = this.context.getComponent(compRender);
      vNode.attributes.children = children;
      vNode.children = [];
      node = new TargetComponent(attributes, vNode);
      node.setContext(this.context);
    } else if (vNode.isBasicValueNode()) {
      node = document.createTextNode(vNode.value) as Text;
    } else if (vNode.isEmptyNode()) {
      return vNode;
    } else if (vNode.isDomNode()) {
      node = document.createElement(vNode.tagType as string);
      for (const key in vNode.attributes) {
        if (vNode.attributes.hasOwnProperty(key)) {
          const value = vNode.attributes[key];
          node.setAttribute(key, value);
        }
      }
    }
    vNode.el = node;

    vNode.mountToDom();
    
    if (_.isArray(vNode.children)) {
      for (const child of vNode.children) {
        this.renderDomElements(vNode, child);
      }
    }
    
    return vNode;
  };
  
  public diffListKeyed(oldList: Array<VirtualNode>, newList: Array<VirtualNode>, key: string): Array<common.TPatch> {
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
  };
  
  public diffFreeList (oldList: Array<VirtualNode>, newList: Array<VirtualNode>): Array<common.TPatch> {
    const actions: Array<common.TPatch> = [];
    
    _.warning(oldList.length === newList.length, 'calculating invalid free list difference, length unequaled');
    
    for (let i = 0; i < oldList.length; i++) {
      const oldItem: VirtualNode = oldList[i];
      const newItem: VirtualNode = newList[i];
      
      // if (oldItem.tagType ! == newItem.tagType) {
      //   actions.push(makeReplaceAction(i, newItem));
      // } else {
      // }
      
      // to be done
    }
    
    return actions;
  }
  
  public diffTree (newVDom: VirtualNode): void {
    const { virtualDom: oldVDom }: VirtualDomMixin = this;
    if (oldVDom.isEmptyNode() && newVDom.isEmptyNode()) {
      return null;
    }
    
    if (!oldVDom.sameTypeWith(newVDom) || oldVDom.isEmptyNode() || newVDom.isEmptyNode()) {
      oldVDom.patch = makeReplaceAction(newVDom);
    } else if (oldVDom.isBasicValueNode() && newVDom.isBasicValueNode()) {
      if ((oldVDom.el as Text).textContent !== (newVDom.el as Text).textContent) {
        oldVDom.patch = makeReplaceAction(newVDom);
      }
    } else {
      const { tagType: oldTagType, attributes: oldAttributes, children: oldChildren } = oldVDom as VirtualNode;
      const { tagType: newTagType, attributes: newAttributes, children: newChildren } = newVDom as VirtualNode;
      if (oldTagType !== newTagType) {
        oldVDom.patch = makeReplaceAction(newVDom);
      } else if (!_.isEqualObject(oldAttributes, newAttributes)) {
        oldVDom.patch = makeUpdatePropsAction(newAttributes);
      }
      
      this.diffFreeList(oldChildren, newChildren);
    }
  }
  
  public reconcile(): void {
    _.dfsWalk(this.virtualDom, 'children', (node: VirtualNode): boolean => {
      if (!node.patch) {
        return true;
      }
      const { action, payload }: common.TPatch = node.patch;
      if (action === ACTION_REPLACE) {
        this.virtualDom = this.renderDomElements(this.stateNode, payload as VirtualNode);
        
        const domChildren: Array<Node> = node.getHTMLDomChildren();
        for (let i = 0; i < domChildren.length; i++) {
          const childDom = domChildren[i];
          
        }
      } else if (action === ACTION_UPDATE_PROPS) {
      } else if (action === ACTION_REORDER) {
      }
      delete node.patch;
      return true;
    });
  }
  
  public render: common.TFuncComponent;
};
