import './declarations';

import * as _ from './utils/index';

import Context from './core/Context';
import Component from './component/Component';
import VirtualDomMixin from './core/virtualDom/index';
import componentFac from './component/factory';

class React extends Context implements VirtualDomMixin {
  public static createElement(tagType: string, attributes: any, ...children: Array<JSX.Element>): JSX.Element {
    const vNode = {
      tagType,
      attributes,
      children
    };
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
  
  public componentDeclarationMap: Map<common.TFuncComponent, typeof Component>;
  
  constructor(vDom: JSX.Element, rootDom: HTMLElement) {
    super();
    _.warning(!_.isNull(vDom), 'empty virtual dom');
    this.componentDeclarationMap = new Map<common.TFuncComponent, typeof Component>();
    this.rootDom = rootDom;
    const child: HTMLElement | Component = this.createDomElements(vDom);
    const childDom: HTMLElement = _.isFunction(vDom.tagType) ? (child as Component).rootDom : (child as HTMLElement);
    this.rootDom.appendChild(childDom);
    this.virtualDom = vDom;
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
  public setContext: (context: React) => void;
  public createDomElements: (vnode: JSX.Element) => HTMLElement | Component;
  public render: common.TFuncComponent = null;
}

_.applyMixins(React, [Context, VirtualDomMixin]);

export default React;
