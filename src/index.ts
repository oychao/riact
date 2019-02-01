import './declarations';

import * as _ from './utils/index';

import Context from './core/Context';
import Component from './core/component/Component';
import VirtualDomMixin from './core/virtualDom/index';
import componentFac from './core/component/factory';
import { TAG_TYPE_BASIC_VALUE, TAG_TYPE_LIST, TAG_TYPE_EMPTY } from './constants/index';
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
      normalizedNode.tagType = TAG_TYPE_LIST,
      normalizedNode.value = child as Array<VirtualNode>;
    } else if (_.isString(child) || _.isNumber(child)) {
      normalizedNode = new VirtualNode();
      normalizedNode.tagType = TAG_TYPE_BASIC_VALUE;
      normalizedNode.value = child;
    } else if (_.isNull(child) || _.isUndefined(child)) {
      normalizedNode = new VirtualNode();
      normalizedNode.tagType = TAG_TYPE_EMPTY;
      normalizedNode.value = child;
    }
    node.children[i] = normalizedNode;
  }
};

class React extends Context implements VirtualDomMixin {
  
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
    
    // const flattenedChildren = _.flatten(children);
    // for (const child of flattenedChildren) {
    //   if (_.isPlainObject(child)) {
    //     child.parentNode = vNode
    //   }
    // }
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
    this.rootDom = rootDom;
    const child: HTMLElement | Component = this.createDomElements(vDom);
    const childDom: HTMLElement = _.isFunction(vDom.tagType) ? (child as Component).rootDom : (child as HTMLElement);
    this.rootDom.appendChild(childDom);
    this.virtualDom = new VirtualNode();
    this.virtualDom.tagType = null;
    this.virtualDom.children = [ vDom ];
    this.virtualDom.el = rootDom;
    vDom.parentNode = this.virtualDom;
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
  public readonly rootDom: HTMLElement;
  public virtualDom: VirtualNode;
  public render: common.TFuncComponent = null;
  public setContext: (context: Context) => void;
  public createDomElements: (vnode: VirtualNode) => HTMLElement | Component;
  public diffListKeyed: (oldList: Array<VirtualNode>, newList: Array<VirtualNode>, key: string) => Array<common.TPatch>;
  public diffFreeList: (oldList: Array<VirtualNode>, newList: Array<VirtualNode>) => Array<common.TPatch>;
  public treeDiff: (newVDom: VirtualNode) => common.TPatch;
  public reconcile: () => void;
}

_.applyMixins(React, [Context, VirtualDomMixin]);

export const createElement = React.createElement;
export const useState = Context.useState;

export default React;
