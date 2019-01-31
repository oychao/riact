import diffFreeList from './diffFreeList';
import diffKeyedList from './diffKeyedList';
import diffTree from './diffTree';

import * as _ from '../../utils/index';
import Context from '../../core/Context';
import Component from '../../component/component';

export default class VirtualDomMixin implements common.IComponent {
  public context: Context;
  public rootDom: HTMLElement;
  public virtualDom: JSX.Element;
  
  public createDomElements(vnode: JSX.Element): HTMLElement | Component {
    let node: HTMLElement | Component = null;
    
    const { tagType, attributes } = vnode as JSX.Element;
    if (_.isFunction(tagType)) {
      const compRender: common.TFuncComponent = (tagType as common.TFuncComponent);
      const TargetComponent: typeof Component = this.context.getComponent(compRender);
      node = new TargetComponent(attributes);
    } else {
      node = document.createElement(vnode.tagType as string);
      for (const key in vnode.attributes) {
        if (vnode.attributes.hasOwnProperty(key)) {
          const value = vnode.attributes[key];
          node.setAttribute(key, value);
        }
      }
    }
    vnode.el = node;
    if (!vnode.parentComp) {
      vnode.parentComp = this;
    }
    
    if (_.isArray(vnode.children)) {
      const children: Array<JSX.Element | string | common.TFuncComponent> = _.flatten(vnode.children);
      for (const vChild of children) {
        if (_.isPlainObject(vChild)) {
          const child: HTMLElement = this.createDomElements(vChild as JSX.Element) as HTMLElement;
          (node as HTMLElement).appendChild(child);
        } else if (_.isString(vChild) || _.isNumber(vChild)) {
          (node as HTMLElement).textContent = vChild as string;
        }
      }
    }
    
    return node;
  };

  public setContext(context: Context): void {
    this.context = context;
  }
  
  public render: common.TFuncComponent;
};
