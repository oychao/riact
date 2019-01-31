import * as _ from '../../utils/index';
import { keyIdxMapFac, makeRemoveAction, makeInsertAction, makeReplaceAction, makeUpdatePropsAction } from './domUtils';
import { ACTION_REPLACE } from 'src/constants/index';
import Context from '../../core/Context';
import Component from '../../component/component';

export default class VirtualDomMixin implements common.IComponent {
  public context: Context;
  public rootDom: HTMLElement;
  public virtualDom: JSX.Element;
  
  public setContext(context: Context): void {
    this.context = context;
  }
  
  public createDomElements(vNode: JSX.Element): HTMLElement | Component {
    let node: HTMLElement | Component = null;
    
    if (_.isNull(vNode)) {
      return null;
    }
    
    const { tagType, attributes } = vNode as JSX.Element;
    if (_.isFunction(tagType)) {
      const compRender: common.TFuncComponent = (tagType as common.TFuncComponent);
      const TargetComponent: typeof Component = this.context.getComponent(compRender);
      node = new TargetComponent(attributes);
      node.setContext(this.context);
    } else {
      node = document.createElement(vNode.tagType as string);
      for (const key in vNode.attributes) {
        if (vNode.attributes.hasOwnProperty(key)) {
          const value = vNode.attributes[key];
          node.setAttribute(key, value);
        }
      }
    }
    vNode.el = node;
    if (!vNode.parentComp) {
      vNode.parentComp = this;
    }
    
    const domRoot: HTMLElement = _.isFunction(tagType) ? (node as Component).rootDom : node as HTMLElement;
    
    if (_.isArray(vNode.children)) {
      const children: Array<JSX.Child> = _.flatten(vNode.children);
      for (const vChild of children) {
        if (_.isPlainObject(vChild)) {
          const { tagType: childTagType } = vChild as JSX.Element;
          (vChild as JSX.Element).parentNode = vNode;
          const child: HTMLElement | Component = this.createDomElements(vChild as JSX.Element);
          const childDomRoot: HTMLElement = _.isFunction(childTagType) ? (child as Component).rootDom : child as HTMLElement;
          domRoot.appendChild(childDomRoot);
        } else if (_.isString(vChild) || _.isNumber(vChild)) {
          domRoot.textContent = vChild as string;
        }
      }
    }
    
    return node;
  };
  
  public diffListKeyed(oldList: Array<JSX.Element>, newList: Array<JSX.Element>, key: string): Array<common.TPatch> {
    const actions: Array<common.TPatch> = [];
    
    const oldKeyIdxMap: Map<string, number> = keyIdxMapFac(oldList, key);
    const newKeyIdxMap: Map<string, number> = keyIdxMapFac(newList, key);
    
    const reservedOldList: Array<JSX.Element> = [];
    
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
  
  public diffFreeList (oldList: Array<JSX.Child>, newList: Array<JSX.Child>): Array<common.TPatch> {
    const actions: Array<common.TPatch> = [];
    
    _.warning(oldList.length === newList.length, 'calculating invalid free list difference, length unequaled');
    
    for (let i = 0; i < oldList.length; i++) {
      const oldItem: JSX.Child = oldList[i];
      const newItem: JSX.Child = newList[i];
      
      // if (oldItem.tagType ! == newItem.tagType) {
      //   actions.push(makeReplaceAction(i, newItem));
      // } else {
      // }
      
      // to be done
    }
    
    return actions;
  };
  
  public treeDiff (oldVDom: JSX.Child, newVDom: JSX.Child, index: number = 0): common.TPatch {
    if (_.isNull(oldVDom) && _.isNull(newVDom)) {
      return null;
    }
    
    if (typeof oldVDom !== typeof newVDom) {
      return makeReplaceAction(index, newVDom);
    }
    
    if (_.isNull(oldVDom)) {
      return makeReplaceAction(index, newVDom);
    } else if (_.isNull(newVDom)) {
      return makeRemoveAction(index);
    } else if (_.isString(oldVDom) && _.isString(newVDom)) {
      if (oldVDom !== newVDom) {
        return makeReplaceAction(index, newVDom);
      } else {
        return null;
      }
    } else {
      const { tagType: oldTagType, attributes: oldAttributes, children: oldChildren } = oldVDom as JSX.Element;
      const { tagType: newTagType, attributes: newAttributes, children: newChildren } = newVDom as JSX.Element;
      if (oldTagType !== newTagType) {
        return makeReplaceAction(index, newVDom);
      } else if (!_.isEqualObject(oldAttributes, newAttributes)) {
        return makeUpdatePropsAction(index, newAttributes);
      }
      
      this.diffFreeList(oldChildren, newChildren);
    }
  }
  
  public reconcile(): void {
    _.dfsWalk(this.virtualDom, 'children', (node: JSX.Element): boolean => {
      if (node.patch.action === ACTION_REPLACE) {
        if (_.isString(node.patch.payload)) {
          // update textContent
        } else {
          const item: JSX.Child = ((node.patch.payload) as { index: number, item: JSX.Child }).item;
          let ancestor: JSX.Element = node.parentNode;
          while (!(ancestor.el instanceof HTMLElement)) {
            ancestor = ancestor.parentNode;
          }
          node.el = this.createDomElements(item as JSX.Element);
        }
        return false;
      }
    });
  }
  
  public render: common.TFuncComponent;
};
