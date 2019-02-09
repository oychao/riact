import * as _ from '../../utils/index';
import {
  NODE_TYPE_TEXT,
  NODE_TYPE_LIST,
  NODE_TYPE_EMPTY,
  ACTION_REPLACE,
  ACTION_UPDATE_PROPS,
  ACTION_REORDER,
  ACTION_REMOVE,
  CLASS_NAME,
  STYLE_NAME,
  ACTION_INSERT,
  CLASS_NAME_PRESERVED,
  KEY_NAME,
  REF_NAME,
} from '../../constants/index';
import Component from '../component/Component';
import Context from '../context/Context';
import {
  keyIdxMapFac,
  makeReplaceAction,
  makeUpdatePropsAction,
  makeRemoveAction,
  makeInsertAction,
  makeReorderAction,
  loadStyle
} from './domUtils';

export const normalizeVirtualNode = function(node: VirtualNode): void {
  let prevSibling: VirtualNode = null;
  for (let i = 0; i < node.children.length; i++) {
    const child: any = node.children[i];
    if (child instanceof VirtualNode) {
      if (prevSibling) {
        prevSibling.nextSibling = child;
      }
      prevSibling = child;
      continue;
    }
    
    const normalizedNode: VirtualNode = new VirtualNode();
    if (prevSibling) {
      prevSibling.nextSibling = normalizedNode;
    }
    prevSibling = normalizedNode;
    if (_.isArray(child)) {
      normalizedNode.tagType = NODE_TYPE_LIST,
      normalizedNode.children = child as Array<VirtualNode>;
      normalizeVirtualNode(normalizedNode);
      for (const subChild of normalizedNode.children) {
        subChild.parentNode = normalizedNode;
      }
    } else if (_.isString(child) || _.isNumber(child)) {
      normalizedNode.tagType = NODE_TYPE_TEXT;
      normalizedNode.value = child;
    } else if (_.isNull(child) || _.isUndefined(child)) {
      normalizedNode.tagType = NODE_TYPE_EMPTY;
      normalizedNode.value = child;
    } else if (_.isFunction(child)) {
      normalizedNode.tagType = child;
    }
    
    node.children[i] = normalizedNode;
  }
};

class VirtualNode implements JSX.Element {
  public static createElement(tagType: string, attrs: any, ...children: Array<VirtualNode>): VirtualNode {
    const vNode: VirtualNode = new VirtualNode();
    vNode.tagType = tagType;
    vNode.children = children;
    
    attrs = attrs || {};
    vNode.attributes = {};
    vNode.events = {};
    Object.entries(attrs).forEach(([key, value]: [string, string | Riact.TStrValObject | Riact.TFunction | Riact.TRef]): void => {
      if (key === CLASS_NAME_PRESERVED) {
        return;
      } else if (key === STYLE_NAME) {
        if (_.isPlainObject(value)) {
          vNode.attributes[STYLE_NAME] = value;
        }
        return;
      } else if (key === KEY_NAME) {
        vNode[KEY_NAME] = value as string;
        return;
      }
      
      if (key === REF_NAME) {
        vNode.ref = value as Riact.TRef;
      }
      
      if (_.isString(value)) {
        vNode.attributes[key] = value as string;
      } else if (_.isArray(value)) {
        if (vNode.isComponentNode() || vNode.isTaggedDomNode() && key === CLASS_NAME) {
          vNode.attributes[key] = value;
        }
      } else if (_.isPlainObject(value)) {
        if (vNode.isComponentNode()) {
          vNode.attributes[key] = value;
        }
      } else if (_.isFunction(value)) {
        if (vNode.isComponentNode()) {
          vNode.attributes[key] = value;
        } else {
          vNode.events[key] = value as Riact.TFunction;
        }
      }
    });
    
    normalizeVirtualNode(vNode);
    
    for (const child of children) {
      if (_.isPlainObject(child)) {
        child.parentNode = vNode
      }
    }
    return vNode;
  }
  
  public static createEmptyNode(): VirtualNode {
    const node: VirtualNode = new VirtualNode();
    node.el = null;
    node.tagType = NODE_TYPE_EMPTY;
    return node;
  }
  
  private static shouldUpdateNode(oldNode: VirtualNode, newNode: VirtualNode): boolean {
    return !_.isEqualObject(oldNode.attributes, newNode.attributes) || !_.isEqualObject(oldNode.events, newNode.events);
  }
  
  private static diffKeyedList(oldList: Array<VirtualNode>, newList: Array<VirtualNode>, key: string = 'key'): Array<Riact.TPatch> {
    const actions: Array<Riact.TPatch> = [];
    
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
        actions.push(makeRemoveAction(i - actions.length));
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
          actions.push(makeRemoveAction(i));
          j++;
        } else {
          actions.push(makeInsertAction(i++, oldItem));
          if (VirtualNode.shouldUpdateNode(oldItem, newItem)) {
            oldItem.patch = makeUpdatePropsAction(newItem.attributes, newItem.events);
          }
        }
      }
    }
    
    while(j < reservedOldList.length) {
      actions.push(makeRemoveAction(j));
      j++;
    }
    
    return actions;
  }
  
  private static diffFreeList (oldList: Array<VirtualNode>, newList: Array<VirtualNode>): void {
    _.warning(oldList.length === newList.length, 'calculating invalid free list difference, length unequaled');
    
    for (let i = 0; i < oldList.length; i++) {
      VirtualNode.diffTree(oldList[i], newList[i]);
    }
  }
  
  public static diffTree (oldVDom: VirtualNode, newVDom: VirtualNode): void {
    if (oldVDom.isEmptyNode() && newVDom.isEmptyNode()) {
      return;
    }
    
    if (!_.isNull(oldVDom.patch) && !_.isUndefined(oldVDom.patch)) {
      return;
    }
    
    if (!oldVDom.sameTypeWith(newVDom) || oldVDom.isEmptyNode() || newVDom.isEmptyNode()) {
      oldVDom.patch = makeReplaceAction(newVDom);
    } else if (oldVDom.isTextNode() && newVDom.isTextNode()) {
      if (oldVDom.value !== newVDom.value) {
        oldVDom.patch = makeReplaceAction(newVDom);
      }
    } else {
      const {
        tagType: oldTagType,
        attributes: oldAttributes,
        children: oldChildren,
        events: oldEvents
      } = oldVDom as VirtualNode;
      const {
        tagType: newTagType,
        attributes: newAttributes,
        children: newChildren,
        events: newEvents
      } = newVDom as VirtualNode;
      if (oldTagType !== newTagType) {
        oldVDom.patch = makeReplaceAction(newVDom);
        return;
      } else if (!_.isEqualObject(oldAttributes, newAttributes) || !_.isEqualObject(oldEvents, newEvents)) {
        oldVDom.patch = makeUpdatePropsAction(newAttributes, newEvents);
      }
      if (oldVDom.isListNode() && newVDom.isListNode()) {
        oldVDom.patch = makeReorderAction(VirtualNode.diffKeyedList(oldChildren, newChildren));
      } else if (!oldVDom.isComponentNode() && !newVDom.isComponentNode()) {
        VirtualNode.diffFreeList(oldChildren, newChildren);
      } else if (oldVDom.isComponentNode() && newVDom.isComponentNode() && _.isArray(oldAttributes.children)) {
        VirtualNode.diffFreeList(oldAttributes.children as Array<VirtualNode>, newChildren);
      }
    }
  }
  
  public tagType: string | Riact.TFuncComponent;
  public attributes?: Riact.TObject;
  public children?: Array<VirtualNode>;
  public el?: Node | Riact.IComponent;
  public events?: Riact.TFuncValObject;
  public key?: string;
  public nextSibling?: VirtualNode;
  public parentNode?: VirtualNode;
  public patch?: Riact.TPatch;
  public ref?: Riact.TRef;
  public reserved?: any;
  public value?: any;
  
  constructor() {}
  
  public findAncestor(conditionFunc: Riact.TFunction): VirtualNode {
    let ancestor: VirtualNode = this.parentNode;
    while (ancestor && !conditionFunc(ancestor)) {
      ancestor = ancestor.parentNode
    }
    return ancestor;
  };
  
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
      const { nextSibling }: VirtualNode = currentNode;
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
    let el: Text | HTMLElement | Component = null;
    
    const { tagType, attributes, children, events } = this;
    if (this.isComponentNode()) {
      const compRender: Riact.TFuncComponent = (tagType as Riact.TFuncComponent);
      const context: Context = this.getParentCompNode().getContext();
      const TargetComponent: typeof Component = context.getComponent(compRender);
      this.attributes.children = children;
      this.children = [];
      el = new TargetComponent(context, this);
      el.renderDom(null);
      return this;
    } else if (this.isTextNode()) {
      el = document.createTextNode(this.value) as Text;
    } else if (this.isEmptyNode()) {
      return this;
    } else if (this.isTaggedDomNode()) {
      el = document.createElement(this.tagType as string);
      if (_.isPlainObject(this.ref)) {
        this.ref.current = el;
      }
      for (const key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          const value: any = attributes[key];
          if (key === CLASS_NAME) {
            if (_.isString(value)) {
              el.className = value;
            } else if (_.isArray(value)) {
              value.forEach((cls: string): void => {
                if (_.isString(cls)) {
                  (el as HTMLElement).classList.add(cls);
                }
              });
            }
          } else if (key === STYLE_NAME) {
            loadStyle(el as HTMLElement, value);
          } else {
            el.setAttribute(key, value);
          }
        }
      }
      for (const key in events) {
        if (events.hasOwnProperty(key)) {
          const eventHandler: Riact.TFunction = events[key];
          if (_.isFunction(eventHandler)) {
            (el as HTMLElement)[key.toLowerCase()] = eventHandler;
          }
        }
      }
    }
    this.el = el;
    this.mountToDom();
    
    return this;
  }
  
  public renderTreeDom(): void {
    if (_.isArray(this.children)) {
      _.dfsWalk(this, 'children', (offspring: VirtualNode): boolean => {
        offspring.renderDom();
        return !offspring.isComponentNode();
      });
    }
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
      if (_.isNull(node.patch) || _.isUndefined(node.patch)) {
        return true;
      }
      const { action, payload }: Riact.TPatch = node.patch as Riact.TPatch;
      if (action === ACTION_REPLACE) {
        node.unmountFromDom();
        if (node.isComponentNode()) {
          (node.el as Component).unmount();
        }
        node.loadData(payload as VirtualNode);
        node.renderDom();
        delete node.patch;
        if (!node.isComponentNode() && _.isArray(node.children)) {
          for (const child of node.children) {
            child.renderTreeDom();
          }
        }
        return false;
      } else if (action === ACTION_UPDATE_PROPS) {
        const isDomNode: boolean = node.isTaggedDomNode();
        const isCompNode: boolean = node.isComponentNode();
        if (isDomNode || isCompNode) {
          const prevProps: Riact.TObject = Object.assign({}, node.attributes);
          const { attributes, events }: Riact.TPatchUpdatePropsPayload = node.patch.payload as Riact.TPatchUpdatePropsPayload;
          for (const key in attributes as Riact.TObject) {
            if (attributes.hasOwnProperty(key)) {
              const value: any = (attributes as Riact.TObject)[key];
              node.attributes[key] = value;
              if (isDomNode) {
                if (key === STYLE_NAME) {
                  loadStyle(node.el as HTMLElement, value);
                } else {
                  (node.el as HTMLElement).setAttribute(key, value);
                }
              }
            }
          }
          if (isCompNode) {
            (node.el as Component).renderDom(prevProps);
          } else if (isDomNode) {
            for (const key in events) {
              if (events.hasOwnProperty(key)) {
                const eventHandler: Riact.TFunction = events[key];
                (node.el as HTMLElement)[key.toLowerCase()] = eventHandler;
              }
            }
          }
        }
      } else if (action === ACTION_REORDER) {
        for (const patch of payload as Array<Riact.TPatch>) {
          const { action: reorderAction, payload: reorderPayload }: Riact.TPatch = patch;
          if (reorderAction === ACTION_REMOVE) {
            const { index }: Riact.TPatchRemovePayload = reorderPayload as Riact.TPatchRemovePayload;
            const [ toBeRemoved ] = node.children.splice((reorderPayload as Riact.TPatchRemovePayload).index, 1);
            const prevSibling: VirtualNode = node.children[index - 1];
            if (prevSibling) {
              prevSibling.nextSibling = toBeRemoved.nextSibling;
            }
            toBeRemoved.unmountFromDom();
          } else if (reorderAction === ACTION_INSERT) {
            const { index, item }: Riact.TPatchInsertPayload = reorderPayload as Riact.TPatchInsertPayload;
            (item as VirtualNode).parentNode = node;
            const prevSibling: VirtualNode = node.children[index - 1];
            const nextSibling: VirtualNode = node.children[index];
            if (prevSibling instanceof VirtualNode) {
              prevSibling.nextSibling = item as VirtualNode;
            }
            if (nextSibling instanceof VirtualNode) {
              (item as VirtualNode).nextSibling = nextSibling;
            }
            node.children.splice(index, 0, item as VirtualNode);
            (item as VirtualNode).renderTreeDom();
          }
        }
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
    if (!_.isUndefined(that.value) && !_.isNull(that.value)) {
      this.value = that.value;
    } else {
      delete this.value;
    }
    delete this.el;
  }
}

export default VirtualNode;
