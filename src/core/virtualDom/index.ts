import diffFreeList from './diffFreeList';
import diffKeyedList from './diffKeyedList';
import diffTree from './diffTree';

import * as _ from '../../utils/index';

export default class DomUpdate {
  public virtualDom: JSX.Element;
  public patchQueue: Array<common.TPatch>;

  public updateDom(): void {}

  public pushPatch(): common.TPatch {
    return this.patchQueue.pop();
  }

  public createDomElements(vnode: JSX.Element): HTMLElement {
    let node: HTMLElement = null;

    const { tagType, attributes } = vnode as JSX.Element;
    if (_.isFunction(tagType)) {
      const compVdom: JSX.Element = (tagType as common.TFuncComponent)(attributes);
      node = this.createDomElements(compVdom);
    } else {
      node = document.createElement(vnode.tagType as string);
      for (const key in vnode.attributes) {
        if (vnode.attributes.hasOwnProperty(key)) {
          const value = vnode.attributes[key];
          node.setAttribute(key, value);
        }
      }
    }
  
    if (_.isArray(vnode.children)) {
      const children: Array<JSX.Element | string | common.TFuncComponent> = _.flatten(vnode.children);
      for (const vChild of children) {
        if (_.isPlainObject(vChild)) {
          const child = this.createDomElements(vChild as JSX.Element);
          node.appendChild(child);
        } else if (_.isString(vChild) || _.isNumber(vChild)) {
          node.textContent = vChild as string;
        }
      }
    }
  
    return node;
  };
};
