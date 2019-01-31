import './declarations';

import * as _ from './utils/index';
import * as domUtils from './core/virtualDom/domUtils';

import Component from './component/component';
import UpdateDom from './core/virtualDom/index';

class React implements UpdateDom {
  public static createElement(tagType: string, attributes: any, ...children: Array<JSX.Element>): JSX.Element {
    return {
      tagType,
      attributes,
      children
    };
  }
  public static render(comp: JSX.Element, root: HTMLElement) {
    if (typeof comp.tagType === 'function') {
      // component
    } else {
      // tag
    }
    root.appendChild(domUtils.createDomElements(comp));
  }
  
  private readonly domCompMap: WeakMap<HTMLElement, Component>;
  private readonly rootDom: HTMLElement;
  constructor(rootDom: HTMLElement) {}
  
  public getCompByDom(dom: HTMLElement): Component {
    return this.domCompMap.get(dom);
  }
  
  public setCompToDom(dom: HTMLElement, comp: Component) {
    this.domCompMap.set(dom, comp);
  }
  
  public patchQueue: Array<common.TPatch>;
  public updateDom: () => void;
  public pushPatch: () => common.TPatch;
}

_.applyMixins(React, [UpdateDom]);

export default React;
