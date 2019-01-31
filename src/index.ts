import './declarations';

import * as _ from './utils/index';

import Context from './core/Context';
import Component from './component/Component';
import VirtualDomMixin from './core/virtualDom/index';
import componentFac from './component/factory';

class React extends Context implements VirtualDomMixin {
  public static createElement(tagType: string, attrs: any, ...children: Array<JSX.Child>): JSX.Element {
    const vNode: JSX.Element = {
      tagType,
      children
    };
    
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
    
    const flattenedChildren = _.flatten(children);
    for (const child of flattenedChildren) {
      if (_.isPlainObject(child)) {
        child.parentNode = vNode
      }
    }
    return vNode;
  }
  
  public static render(vDom: JSX.Element, rootDom: HTMLElement) {
    rootDom.innerHTML = '';
    return new React(vDom, rootDom);
  }
  
  private componentDeclarationMap: Map<common.TFuncComponent, typeof Component>;
  
  constructor(vDom: JSX.Element, rootDom: HTMLElement) {
    super();
    _.warning(!_.isNull(vDom), 'empty virtual dom');
    _.warning(rootDom instanceof HTMLElement, 'invalid root dom element');
    this.componentDeclarationMap = new Map<common.TFuncComponent, typeof Component>();
    this.rootDom = rootDom;
    const child: HTMLElement | Component = this.createDomElements(vDom);
    const childDom: HTMLElement = _.isFunction(vDom.tagType) ? (child as Component).rootDom : (child as HTMLElement);
    this.rootDom.appendChild(childDom);
    this.virtualDom = {
      tagType: null,
      children: [vDom],
      el: rootDom
    };
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
  public virtualDom: JSX.Element;
  public render: common.TFuncComponent = null;
  public setContext: (context: Context) => void;
  public createDomElements: (vnode: JSX.Element) => HTMLElement | Component;
  public diffListKeyed: (oldList: Array<JSX.Element>, newList: Array<JSX.Element>, key: string) => Array<common.TPatch>;
  public diffFreeList: (oldList: Array<JSX.Element>, newList: Array<JSX.Element>) => Array<common.TPatch>;
  public treeDiff: (newVDom: JSX.Element) => common.TPatch;
  public reconcile: () => void;
}

_.applyMixins(React, [Context, VirtualDomMixin]);

export const createElement = React.createElement;
export const useState = Context.useState;

export default React;
