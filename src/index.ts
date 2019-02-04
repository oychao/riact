import './declarations';

import * as _ from './utils/index';

import Context from './core/context/Context';
import {
  NODE_TYPE_TEXT,
  NODE_TYPE_LIST,
  NODE_TYPE_EMPTY,
  CLASS_NAME_PRESERVED,
  STYLE_NAME,
  REF_NAME,
  KEY_NAME
} from './constants/index';
import VirtualNode from './core/virtualDom/VirtualNode';
import StaticContext from './core/context/StaticContext';

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
    }
    
    node.children[i] = normalizedNode;
  }
};

export default class React extends Context implements common.IComponent {
  
  public static createRef(): common.TRef {
    return {
      current: null
    };
  }
  
  public static createElement(tagType: string, attrs: any, ...children: Array<VirtualNode>): VirtualNode {
    const vNode: VirtualNode = new VirtualNode();
    vNode.tagType = tagType;
    vNode.children = children;
    
    attrs = attrs || {};
    vNode.attributes = {};
    vNode.events = {};
    Object.entries(attrs).forEach(([key, value]: [string, string | common.TStrValObject | common.TFunction | common.TRef]): void => {
      if (key === CLASS_NAME_PRESERVED) {
        return;
      } else if (key === STYLE_NAME) {
        if (_.isPlainObject(value)) {
          vNode.attributes[key] = value;
        }
        return;
      } else if (key === KEY_NAME) {
        vNode.key = value as string;
        return;
      }
      
      if (key === REF_NAME) {
        vNode.ref = value as common.TRef;
      }
      
      if (_.isString(value)) {
        vNode.attributes[key] = value as string;
      } else if (_.isPlainObject(value) || _.isArray(value)) {
        if (vNode.isComponentNode()) {
          vNode.attributes[key] = value;
        }
      } else if (_.isFunction(value)) {
        if (vNode.isComponentNode()) {
          vNode.attributes[key] = value;
        } else {
          vNode.events[key] = value as common.TFunction;
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
  
  public static render(virtualNode: JSX.Element, rootDom: HTMLElement) {
    rootDom.innerHTML = '';
    return new React(virtualNode as VirtualNode, rootDom);
  }
  
  constructor(virtualNode: VirtualNode, rootDom: HTMLElement) {
    super();
    _.warning(!_.isNull(virtualNode), 'empty virtual dom');
    _.warning(rootDom instanceof HTMLElement, 'invalid root dom element');
    
    this.virtualNode = virtualNode;
    
    const rootNode: VirtualNode = new VirtualNode();
    rootNode.tagType = rootDom.tagName;
    rootNode.el = rootDom;
    
    this.virtualNode = new VirtualNode();
    rootNode.children = [ this.virtualNode ];
    this.virtualNode.tagType = () => this.virtualNode; // basicly this is a special function component;
    this.virtualNode.el = this;
    this.virtualNode.parentNode = rootNode;
    
    const emptyNode = VirtualNode.createEmptyNode();
    this.virtualNode.children = [ emptyNode ];
    emptyNode.parentNode = this.virtualNode;
    
    VirtualNode.diffTree(emptyNode, virtualNode);
    this.virtualNode.reconcile();
  }
  
  public virtualNode: VirtualNode;
  public readonly context: Context;
  public render(): JSX.Element {
    return this.virtualNode;
  }
  public getContext(): common.IContext {
    return this;
  }
}

export const createElement = React.createElement;
export const useState = StaticContext.useState;
export const createRef = React.createRef;
