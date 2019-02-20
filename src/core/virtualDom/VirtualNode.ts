import * as _ from '../../utils/index';
import {
  NODE_TYPE_TEXT,
  NODE_TYPE_LIST,
  NODE_TYPE_EMPTY,
  ACTION_REPLACE,
  ACTION_UPDATE_PROPS,
  ACTION_REORDER,
  ACTION_REMOVE,
  ACTION_INSERT,
  PROP_CLASS_PRESERVED,
  PROP_CLASS,
  PROP_STYLE,
  PROP_KEY,
  PROP_REF,
  PROP_VALUE,
  PROP_CHILDREN,
  PROP_DANGEROUS_HTML,
  PROP_EVENT_PREFIX,
  ACTION_MOVE,
  ACTION_REORDER_BEFORE_16,
  ACTION_REMOVE_NEXT,
  NODE_TYPE_FRAGMENT
} from '../../constants/index';
import {
  keyIdxMapFac,
  makeReplaceAction,
  makeUpdatePropsAction,
  makeRemoveAction,
  makeInsertAction,
  makeReorderAction,
  loadStyle,
  loadDangerousInnerHTML,
  makeReorderActionBefore16
} from './domUtils';
import Component from '../component/Component';
import AppContext from '../context/AppContext';

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
      normalizedNode.tagType = NODE_TYPE_LIST;
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
  public static createElement(
    tagType: string | Riact.TFuncComponent,
    attrs: any,
    ...children: Array<VirtualNode>
  ): VirtualNode {
    const vNode: VirtualNode = new VirtualNode();
    vNode.tagType = tagType;
    attrs = attrs || {};
    vNode.attributes = {};
    vNode.events = {};
    vNode.children = children || [];
    if (vNode.isFragmentNode()) {
      attrs = {};
    }
    Object.entries(attrs).forEach(
      ([key, value]: [
        string,
        string | Riact.TStrValObject | Riact.TFunction | Riact.TRef
      ]): void => {
        if (key === PROP_CLASS_PRESERVED || key === PROP_CHILDREN) {
          // preserved property names
        } else if (key === PROP_STYLE) {
          if (_.isPlainObject(value)) {
            vNode.attributes[PROP_STYLE] = value;
          }
        } else if (key === PROP_KEY) {
          vNode[PROP_KEY] = value as string;
        } else if (key === PROP_DANGEROUS_HTML) {
          if (_.isString(value) || _.isFunction(value)) {
            vNode.attributes[PROP_DANGEROUS_HTML] = value;
          }
        } else {
          if (key === PROP_REF) {
            vNode.ref = value as Riact.TRef;
          }
          if (_.isString(value)) {
            vNode.attributes[key] = value as string;
          } else if (_.isArray(value)) {
            if (
              vNode.isComponentNode() ||
              (vNode.isTaggedDomNode() && key === PROP_CLASS)
            ) {
              vNode.attributes[key] = value;
            }
          } else if (_.isPlainObject(value)) {
            if (vNode.isComponentNode()) {
              vNode.attributes[key] = value;
            }
          } else if (_.isFunction(value)) {
            if (
              vNode.isTaggedDomNode() &&
              key.slice(0, 2) === PROP_EVENT_PREFIX
            ) {
              vNode.events[key] = value as Riact.TFunction;
            } else {
              vNode.attributes[key] = value;
            }
          }
        }
      }
    );

    normalizeVirtualNode(vNode);
    if (vNode.isComponentNode()) {
      vNode.attributes.children = VirtualNode.createElement(
        NODE_TYPE_FRAGMENT,
        null,
        ...vNode.children
      );
      vNode.children = [];
    }

    for (const child of vNode.children) {
      if (_.isPlainObject(child)) {
        child.parentNode = vNode;
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

  /**
   * !meant to be keyed list diff algorithm before React 16, bad implementation with bugs
   * @deprecated
   */
  private static diffKeyedListBefore16(
    oldList: Array<VirtualNode>,
    newList: Array<VirtualNode>,
    key: string = 'key'
  ): Array<Riact.TPatch> {
    const actions: Array<Riact.TPatch> = [];

    const oldKeyIdxMap: Map<string, number> = keyIdxMapFac(oldList, key);
    const newKeyIdxMap: Map<string, number> = keyIdxMapFac(newList, key);

    const reservedOldList: Array<VirtualNode> = [];

    let i: number;
    let j: number;

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
        VirtualNode.diffTree(oldItem, newItem);
        j++;
        i++;
      } else {
        if (nextOldItem && nextOldItem.key === newItem.key) {
          actions.push(makeRemoveAction(i));
          j++;
        } else {
          actions.push(makeInsertAction(i++, newItem));
        }
      }
    }

    while (j < reservedOldList.length) {
      actions.push(makeRemoveAction(j));
      j++;
    }

    return actions;
  }

  /**
   * trim same elements for two arrays, return deviation counts of beginning
   * and ending
   * @param list1 array of object
   * @param list2 array of object
   * @param key key name for identification
   */
  private static trimTwoLists(
    list1: Array<VirtualNode>,
    list2: Array<VirtualNode>,
    key: string
  ): [number, number] {
    let sd: number = 0;
    let ed: number = 0;
    let idx1: number = 0,
      idx2: number = 0;
    const { length: len1 }: Array<VirtualNode> = list1;
    const { length: len2 }: Array<VirtualNode> = list2;
    while (sd < len1 && sd < len2 && list1[idx1][key] === list2[idx1][key]) {
      VirtualNode.diffTree(list1[idx1], list2[idx2]);
      sd++;
      idx1 = sd;
      idx2 = sd;
    }
    idx1 = len1 - ed - 1;
    idx2 = len2 - ed - 1;
    while (
      sd + ed < len1 &&
      sd + ed < len2 &&
      list1[idx1][key] === list2[idx2][key]
    ) {
      VirtualNode.diffTree(list1[idx1], list2[idx2]);
      ed++;
      idx1 = len1 - ed - 1;
      idx2 = len2 - ed - 1;
    }
    return [sd, ed];
  }

  /**
   * diff two arrays of number, Takes O(nlogn) time in expectation
   * @param list1 array of characters
   * @param list2 array of characters
   */
  private static diffKeyedList(
    list1: Array<VirtualNode>,
    list2: Array<VirtualNode>,
    key: string = PROP_KEY
  ): Array<Riact.TPatch> {
    const { length: len1 }: Array<VirtualNode> = list1;
    const { length: len2 }: Array<VirtualNode> = list2;
    const [sd, ed]: [number, number] = VirtualNode.trimTwoLists(
      list1,
      list2,
      key
    );
    const pHeaderIns: Array<VirtualNode> = []; // tail insertions
    const pMovs: Array<Riact.TPatch> = []; // move patches
    const pRmvs: Array<Riact.TPatch> = []; // remove patches
    const pInss: Map<VirtualNode, Array<Riact.TPatch>> = new Map<
      VirtualNode,
      Array<Riact.TPatch>
    >();
    const IM: Map<string, number> = new Map<string, number>(); // index map of length1
    const IT: Array<number> = new Array(len2 - sd - ed).fill(-1); // index table of length2
    let LIS: Array<number>; // longest increasing subsequence of index table
    let P: Array<Riact.TPatch>; // all patches
    let shouldMoved: boolean = false; // no need to move if LIS.length == IT.length(positive numbers only)
    let i: number,
      j: number,
      k: number,
      end: number,
      last: number,
      patches: Array<Riact.TPatch>,
      len: number; // other temp variables
    for (i = sd, end = len2 - ed; i < end; i++) {
      IM.set(list2[i].key, i);
    }
    last = -1;
    for (i = sd, end = len1 - ed; i < end; i++) {
      j = IM.get(list1[i].key);
      if (j !== undefined) {
        VirtualNode.diffTree(list1[i], list2[j]);
        IT[j - sd] = i;
        if (j < last) {
          shouldMoved = true;
        } else {
          last = j;
        }
      } else {
        pRmvs.push({
          type: ACTION_REMOVE_NEXT,
          payload: list1[i - 1]
        });
      }
    }
    LIS = _.calcLis(IT);
    last = IT.length;
    for (i = len2 - ed - 1, j = LIS.length - 1, end = sd - 1; i > end; i--) {
      k = i - sd;
      if (IT[k] === -1) {
        if (LIS[j] !== undefined) {
          if (pInss.has(list1[IT[last]])) {
            patches = pInss.get(list1[IT[last]]);
          } else {
            patches = [];
            pInss.set(list1[IT[last]], patches);
          }
          patches.push({
            type: ACTION_INSERT,
            payload: {
              item: list2[i],
              to: list1[IT[last] - 1]
            }
          });
        } else {
          pHeaderIns.push(list2[i]);
        }
      } else if (shouldMoved) {
        if (j < 0 || LIS[j] !== IT[k]) {
          pMovs.push({
            type: ACTION_MOVE,
            payload: {
              to:
                IT[last] === undefined ? list1[len1 - 1] : list1[IT[last] - 1],
              item: list1[IT[i] - 1]
            }
          });
        } else {
          j--;
        }
      }
      last = IT[k] === -1 ? last : k;
    }

    P = [...pMovs, ...pRmvs];
    pInss.forEach(
      (val: Array<Riact.TPatch>, key: JSX.Element): void => {
        for (i = 0, len = val.length; i < len; i++) {
          P.push(val[i]);
        }
      }
    );
    for (i = 0, len = pHeaderIns.length; i < len; i++) {
      P.push({
        type: ACTION_INSERT,
        payload: {
          index: 0,
          item: pHeaderIns[i]
        }
      });
    }

    return P;
  }

  private static diffFreeList(
    oldList: Array<VirtualNode>,
    newList: Array<VirtualNode>
  ): void {
    _.warning(
      oldList.length === newList.length,
      'calculating invalid free list difference, length unequaled'
    );

    for (let i = 0; i < oldList.length; i++) {
      VirtualNode.diffTree(oldList[i], newList[i]);
    }
  }

  public static diffTree(oldVDom: VirtualNode, newVDom: VirtualNode): void {
    if (oldVDom.isEmptyNode() && newVDom.isEmptyNode()) {
      return;
    }

    // difference has already been calculated
    if (!_.isNull(oldVDom.patch) && !_.isUndefined(oldVDom.patch)) {
      return;
    }

    if (
      !oldVDom.sameTypeWith(newVDom) ||
      oldVDom.isEmptyNode() ||
      newVDom.isEmptyNode()
    ) {
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
      } else if (
        !_.isEqualObject(oldAttributes, newAttributes) ||
        !_.isEqualObject(oldEvents, newEvents) ||
        (_.isUndefined(oldAttributes) &&
          _.isUndefined(newAttributes) &&
          _.isUndefined(oldEvents) &&
          _.isUndefined(newEvents))
      ) {
        oldVDom.patch = makeUpdatePropsAction(newAttributes, newEvents);
      }
      if (oldVDom.isListNode() && newVDom.isListNode()) {
        // oldVDom.patch = makeReorderActionBefore16(
        //   VirtualNode.diffKeyedListBefore16(oldChildren, newChildren)
        // );
        oldVDom.patch = makeReorderAction(
          VirtualNode.diffKeyedList(oldChildren, newChildren)
        );
      } else if (!oldVDom.isComponentNode() && !newVDom.isComponentNode()) {
        VirtualNode.diffFreeList(oldChildren, newChildren);
      } else if (oldVDom.isComponentNode() && newVDom.isComponentNode()) {
        const comp: Component = oldVDom.el as Component;
        const prevProps: Riact.TObject = Object.assign({}, oldVDom.attributes);
        oldVDom.attributes = newVDom.attributes;
        oldVDom.events = newVDom.events;
        if (!comp.isWaitingContextProviderUpdate()) {
          comp.renderDom(prevProps);
        }
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
      ancestor = ancestor.parentNode;
    }
    return ancestor;
  }

  public isEmptyNode(): boolean {
    return this.tagType === NODE_TYPE_EMPTY;
  }
  public isTextNode(): boolean {
    return this.tagType === NODE_TYPE_TEXT;
  }
  public isListNode(): boolean {
    return this.tagType === NODE_TYPE_LIST;
  }
  public isFragmentNode(): boolean {
    return this.tagType === NODE_TYPE_FRAGMENT;
  }
  public isComponentNode(): boolean {
    return _.isFunction(this.tagType);
  }
  public isTaggedDomNode(): boolean {
    return (
      !this.isEmptyNode() &&
      !this.isComponentNode() &&
      !this.isTextNode() &&
      !this.isListNode() &&
      !this.isFragmentNode()
    );
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

  public getDomChildrenVNodes(): Array<VirtualNode> {
    if (this.isTaggedDomNode() || this.isTextNode()) {
      return [this];
    } else if (this.isEmptyNode()) {
      return [];
    }
    const vNodes: Array<VirtualNode> = [];
    _.dfsWalk(
      this,
      PROP_CHILDREN,
      (child: VirtualNode): boolean => {
        if (child.isTaggedDomNode() || child.isTextNode()) {
          vNodes.push(child);
          return false;
        }
        return true;
      }
    );
    return vNodes;
  }

  public getChildrenCompNodes(): Array<Component> {
    const comps: Array<Component> = [];
    _.dfsWalk(
      this,
      PROP_CHILDREN,
      (child: VirtualNode): boolean => {
        if (child.isComponentNode()) {
          comps.push(child.el as Component);
          return false;
        }
        return true;
      }
    );
    return comps;
  }

  public getMostLeftDomNodeInSubTree(): VirtualNode {
    const { children }: VirtualNode = this;
    if (!_.isArray(children) || !children.length) {
      return null;
    }
    for (const child of children) {
      if (child.isComponentNode() || child.isFragmentNode()) {
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
    } while (!currentNode.isTaggedDomNode());
    return targetNode && (targetNode.el as Node);
  }

  public reflectToDom(): VirtualNode {
    let el: Text | HTMLElement | Component = null;
    const { tagType, attributes, events } = this;
    if (this.isComponentNode()) {
      const compRender: Riact.TFuncComponent = tagType as Riact.TFuncComponent;
      const appContext: AppContext = this.getParentCompNode().getAppContext();
      const TargetComponent: typeof Component = appContext.getComponent(
        compRender
      );
      el = new TargetComponent(appContext, this);
      el.forceRenderDom();
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
          if (key === PROP_CLASS) {
            if (_.isString(value)) {
              el.className = value;
            } else if (_.isArray(value)) {
              value.forEach(
                (cls: string): void => {
                  if (_.isString(cls)) {
                    (el as HTMLElement).classList.add(cls);
                  }
                }
              );
            }
          } else if (key === PROP_STYLE) {
            loadStyle(el as HTMLElement, value);
          } else if (key === PROP_DANGEROUS_HTML) {
            // children nodes will be disactive due to the dangerous inner html
            this.children = [];
            loadDangerousInnerHTML(el as HTMLElement, value);
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

  public reflectDescendantsToDom(): void {
    _.dfsWalk(
      this,
      PROP_CHILDREN,
      (offspring: VirtualNode): boolean => {
        offspring.reflectToDom();
        return !offspring.isComponentNode();
      }
    );
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
    } else if (this.isComponentNode() || this.isFragmentNode()) {
      const domChildrenVNodes: Array<VirtualNode> = this.getDomChildrenVNodes();
      for (const vNode of domChildrenVNodes) {
        (vNode.el as Node).parentNode.removeChild(vNode.el as Node);
      }
    }
  }

  public reconcile(): void {
    _.dfsWalk(
      this,
      PROP_CHILDREN,
      (node: VirtualNode): boolean => {
        if (_.isNull(node.patch) || _.isUndefined(node.patch)) {
          return true;
        }
        const { type, payload }: Riact.TPatch = node.patch as Riact.TPatch;
        if (type === ACTION_REPLACE) {
          node.unmountFromDom();
          if (node.isComponentNode()) {
            (node.el as Component).unmount();
          } else if (!node.isEmptyNode() && !node.isTextNode()) {
            const comps: Array<Component> = node.getChildrenCompNodes();
            for (const comp of comps) {
              comp.unmount();
            }
          }
          node.loadAttributes(payload as VirtualNode);
          delete node.patch;
          node.reflectToDom();
          if (!node.isComponentNode() && _.isArray(node.children)) {
            for (const child of node.children) {
              child.reflectDescendantsToDom();
            }
          }
          return false;
        } else if (type === ACTION_UPDATE_PROPS) {
          const isDomNode: boolean = node.isTaggedDomNode();
          const isCompNode: boolean = node.isComponentNode();
          if (isDomNode || isCompNode) {
            const prevProps: Riact.TObject = Object.assign({}, node.attributes);
            const { attributes, events }: Riact.TPatchUpdatePropsPayload = node
              .patch.payload as Riact.TPatchUpdatePropsPayload;
            for (const key in attributes as Riact.TObject) {
              if (attributes.hasOwnProperty(key)) {
                const value: any = (attributes as Riact.TObject)[key];
                node.attributes[key] = value;
                if (isDomNode) {
                  if (key === PROP_STYLE) {
                    loadStyle(
                      node.el as HTMLElement,
                      value,
                      prevProps[PROP_STYLE]
                    );
                  } else if (key === PROP_VALUE) {
                    (node.el as HTMLInputElement).value = value;
                  } else if (key === PROP_DANGEROUS_HTML) {
                    // children nodes will be disactive due to the dangerous inner html
                    node.children = [];
                    loadDangerousInnerHTML(node.el as HTMLElement, value);
                  } else {
                    (node.el as HTMLElement).setAttribute(key, value);
                  }
                }
              }
            }
            if (isCompNode) {
              (node.el as Component).forceRenderDom();
            } else if (isDomNode) {
              for (const key in events) {
                if (events.hasOwnProperty(key)) {
                  const eventHandler: Riact.TFunction = events[key];
                  (node.el as HTMLElement)[key.toLowerCase()] = eventHandler;
                }
              }
            }
          }
        } else if (type === ACTION_REORDER) {
          let startNode: VirtualNode = node[PROP_CHILDREN][0];
          for (const patch of payload as Array<Riact.TPatch>) {
            const {
              type: reorderAction,
              payload: reorderPayload
            }: Riact.TPatch = patch;
            if (reorderAction === ACTION_INSERT) {
              // handle insert
              const {
                index,
                item,
                to
              }: Riact.TPatchInsertPayload = reorderPayload as Riact.TPatchInsertPayload;
              if (to) {
                item.nextSibling = to.nextSibling;
                to.nextSibling = item;
              } else if (index === 0) {
                item.nextSibling = startNode;
                startNode = item as VirtualNode;
              }
              (item as VirtualNode).parentNode = node;
              (item as VirtualNode).reflectDescendantsToDom();
            } else if (reorderAction === ACTION_REMOVE_NEXT) {
              // handle remove
              let toBeRemoved: VirtualNode;
              if (_.isUndefined(reorderPayload)) {
                toBeRemoved = node[PROP_CHILDREN][0];
                startNode = node[PROP_CHILDREN][1];
              } else {
                toBeRemoved = (reorderPayload as VirtualNode).nextSibling;
                (reorderPayload as VirtualNode).nextSibling = (reorderPayload as VirtualNode).nextSibling.nextSibling;
              }
              toBeRemoved.unmountFromDom();
            } else if (reorderAction === ACTION_MOVE) {
              // handle move
              const {
                item,
                to
              }: Riact.TPatchInsertPayload = reorderPayload as Riact.TPatchInsertPayload;
              let target: VirtualNode;
              // reorder child chain
              if (_.isUndefined(item)) {
                target = startNode;
                startNode = startNode.nextSibling;
              } else {
                target = item.nextSibling as VirtualNode;
                item.nextSibling = target.nextSibling;
              }
              if (_.isUndefined(to)) {
                target.nextSibling = startNode;
                startNode = target;
              } else {
                target.nextSibling = to.nextSibling as VirtualNode;
                to.nextSibling = target;
              }
              // mount to dom
              if (target.isListNode() || target.isComponentNode()) {
                const domChildrenVNodes: Array<
                  VirtualNode
                > = target.getDomChildrenVNodes();
                for (const vNode of domChildrenVNodes) {
                  vNode.mountToDom();
                }
              } else {
                target.mountToDom();
              }
            }
          }
          const newChildren: Array<VirtualNode> = [];
          let pivot: VirtualNode = startNode;
          while (pivot) {
            newChildren.push(pivot);
            pivot = pivot.nextSibling;
          }
          node.children = newChildren;
        } else if (type === ACTION_REORDER_BEFORE_16) {
          /**
           * @decprecated
           */
          for (const patch of payload as Array<Riact.TPatch>) {
            const {
              type: reorderAction,
              payload: reorderPayload
            }: Riact.TPatch = patch;
            if (reorderAction === ACTION_REMOVE) {
              const {
                index
              }: Riact.TPatchRemovePayload = reorderPayload as Riact.TPatchRemovePayload;
              const [toBeRemoved] = node.children.splice(
                (reorderPayload as Riact.TPatchRemovePayload).index,
                1
              );
              const prevSibling: VirtualNode = node.children[index - 1];
              if (prevSibling) {
                prevSibling.nextSibling = toBeRemoved.nextSibling;
              }
              toBeRemoved.unmountFromDom();
            } else if (reorderAction === ACTION_INSERT) {
              const {
                index,
                item
              }: Riact.TPatchInsertPayload = reorderPayload as Riact.TPatchInsertPayload;
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
              (item as VirtualNode).reflectDescendantsToDom();
            }
          }
        }
        delete node.patch;
        return true;
      }
    );
  }

  public loadAttributes(that: VirtualNode): void {
    this.tagType = that.tagType;
    this.attributes = that.attributes || {};
    this.children = that.children || [];
    this.events = that.events || {};
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
