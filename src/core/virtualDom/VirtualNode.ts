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
  loadStyle,
  loadDangerousInnerHTML
} from './domUtils';
import Component from '../component/Component';
import AppContext from '../context/AppContext';
import Diffable, { DiffAlgorithmFactory } from './Diffable';
import DiffAlgorithmLisBased from './DiffAlgorithmLisBased';
import DiffAlgorithmBefore16 from './DiffAlgorithmBefore16';

const normalizeVirtualNode = function(node: VirtualNode): void {
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

  @DiffAlgorithmFactory(DiffAlgorithmLisBased)
  private diffable: Diffable;

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

  public setDiffable(diffable: Diffable): void {
    this.diffable = diffable;
  }

  public diffThat(that: VirtualNode): void {
    this.diffable.diffTree(this, that);
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
              if (!_.isUndefined(to)) {
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
