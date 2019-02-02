import './declarations';

import * as _ from './utils/index';

import Context from './core/Context';
import Component from './core/component/Component';
import VirtualDomMixin from './core/virtualDom/index';
import componentFac from './core/component/factory';
import { NODE_TYPE_BASIC_VALUE, NODE_TYPE_LIST, NODE_TYPE_EMPTY, NODE_TYPE_ROOT } from './constants/index';
import VirtualNode from './core/VirtualNode';

const normalizeVirtualNode = function(node: VirtualNode): void {
  for (let i = 0; i < node.children.length; i++) {
    const child: any = node.children[i];
    let normalizedNode: VirtualNode = child;
    if (_.isArray(child)) {
      for (let j = 0; j < child.length; j++) {
        const element: VirtualNode = child[j];
        normalizeVirtualNode(element as VirtualNode);
      }
      normalizedNode = new VirtualNode();
      normalizedNode.parentNode = node;
      normalizedNode.tagType = NODE_TYPE_LIST,
      normalizedNode.children = child as Array<VirtualNode>;
      for (const subChild of normalizedNode.children) {
        subChild.parentNode = normalizedNode;
      }
    } else if (_.isString(child) || _.isNumber(child)) {
      normalizedNode = new VirtualNode();
      normalizedNode.parentNode = node;
      normalizedNode.tagType = NODE_TYPE_BASIC_VALUE;
      normalizedNode.value = child;
    } else if (_.isNull(child) || _.isUndefined(child)) {
      normalizedNode = new VirtualNode();
      normalizedNode.parentNode = node;
      normalizedNode.tagType = NODE_TYPE_EMPTY;
      normalizedNode.value = child;
    }
    node.children[i] = normalizedNode;
  }
};

export default class React extends Context implements VirtualDomMixin {
  
  public static createElement(tagType: string, attrs: any, ...children: Array<VirtualNode>): VirtualNode {
    const vNode: VirtualNode = new VirtualNode();
    vNode.tagType = tagType;
    vNode.children = children;
    
    if (_.isPlainObject(attrs)) {
      vNode.attributes = {};
      vNode.events = {};
      Object.entries(attrs).forEach(([key, value]: [string, string | common.TStrValObject | common.TFunction]): void => {
        if (_.isString(value)) {
          vNode.attributes[key] = value as string;
        } else if (_.isPlainObject(value)) {
          // maybe style object
        } else if (_.isFunction(value)) {
          vNode.events[key] = value as common.TFunction;
        }
      });
    }
    
    normalizeVirtualNode(vNode);
    
    for (const child of children) {
      if (_.isPlainObject(child)) {
        child.parentNode = vNode
      }
    }
    return vNode;
  }
  
  public static render(vDom: JSX.Element, rootDom: HTMLElement) {
    rootDom.innerHTML = '';
    return new React(vDom as VirtualNode, rootDom);
  }
  
  private componentDeclarationMap: Map<common.TFuncComponent, typeof Component>;
  
  constructor(vDom: VirtualNode, rootDom: HTMLElement) {
    super();
    _.warning(!_.isNull(vDom), 'empty virtual dom');
    _.warning(rootDom instanceof HTMLElement, 'invalid root dom element');
    this.componentDeclarationMap = new Map<common.TFuncComponent, typeof Component>();
    
    this.stateNode = new VirtualNode();
    this.stateNode.tagType = NODE_TYPE_ROOT;
    this.stateNode.el = rootDom;
    
    this.virtualDom = new VirtualNode();
    this.virtualDom.tagType = NODE_TYPE_EMPTY;
    this.virtualDom.children = [];
    
    this.diffTree(vDom);
    this.reconcile();
  }
  
  public getComponent(render: common.TFuncComponent): typeof Component {
    if (this.componentDeclarationMap.has(render)) {
      return this.componentDeclarationMap.get(render) ;
    } else {
      const TargetComponent: typeof Component = componentFac(render);
      this.componentDeclarationMap.set(render, TargetComponent);
      return TargetComponent;
    }
  }
  
  public readonly context: Context = this;
  public readonly stateNode: VirtualNode;
  public virtualDom: VirtualNode;
  public render: common.TFuncComponent = null;
  public setContext: (context: Context) => void;
  public setStateNode: (stateNode: VirtualNode) => void;
  public renderDomElements: (domRoot: VirtualNode, vnode: VirtualNode) => VirtualNode;
  public diffListKeyed: (oldList: Array<VirtualNode>, newList: Array<VirtualNode>, key: string) => Array<common.TPatch>;
  public diffFreeList: (oldList: Array<VirtualNode>, newList: Array<VirtualNode>) => Array<common.TPatch>;
  public diffTree: (newVDom: VirtualNode) => common.TPatch;
  public reconcile: () => void;
}

_.applyMixins(React, [Context, VirtualDomMixin]);

export const createElement = React.createElement;
export const useState = Context.useState;
