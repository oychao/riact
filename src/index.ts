import './declarations';

import * as _ from './utils/index';

import Component from './component/component';
import UpdateDomMixin from './core/virtualDom/index';

class React implements UpdateDomMixin {
  public static createElement(tagType: string, attributes: any, ...children: Array<JSX.Element>): JSX.Element {
    return {
      tagType,
      attributes,
      children
    };
  }
  public static render(vDom: JSX.Element, rootDom: HTMLElement) {
    rootDom.innerHTML = '';
    return new React(vDom, rootDom);
  }
  
  private readonly rootDom: HTMLElement;
  constructor(vDom: JSX.Element, rootDom: HTMLElement) {
    this.rootDom = rootDom;
    this.rootDom.appendChild(this.createDomElements(vDom));

    this.virtualDom = vDom;
    this.patchQueue = [];
  }
  
  public virtualDom: JSX.Element;
  public patchQueue: Array<common.TPatch>;
  public updateDom: () => void;
  public pushPatch: () => common.TPatch;
  public createDomElements: (vnode: JSX.Element) => HTMLElement;
}

_.applyMixins(React, [UpdateDomMixin]);

export default React;
