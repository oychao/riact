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
  
  public createDomElements(vNode: JSX.Element): HTMLElement | Component {
    let node: HTMLElement | Component = null;
    
    const { tagType, attributes } = vNode as JSX.Element;
    if (_.isFunction(tagType)) {
      const compRender: common.TFuncComponent = (tagType as common.TFuncComponent);
      const TargetComponent: typeof Component = this.context.getComponent(compRender);
      node = new TargetComponent(attributes);
    } else {
      node = document.createElement(vNode.tagType as string);
      for (const key in vNode.attributes) {
        if (vNode.attributes.hasOwnProperty(key)) {
          const value = vNode.attributes[key];
          node.setAttribute(key, value);
        }
      }
    }
    vNode.el = node;
    if (!vNode.parentComp) {
      vNode.parentComp = this;
    }
    
    const domRoot: HTMLElement = _.isFunction(tagType) ? (node as Component).rootDom : node as HTMLElement;
    
    if (_.isArray(vNode.children)) {
      const children: Array<JSX.Element | string> = _.flatten(vNode.children);
      for (const vChild of children) {
        if (_.isPlainObject(vChild)) {
          const { tagType: childTagType } = vChild as JSX.Element;
          const child: HTMLElement | Component = this.createDomElements(vChild as JSX.Element);
          const childDomRoot: HTMLElement = _.isFunction(childTagType) ? (child as Component).rootDom : child as HTMLElement;
          domRoot.appendChild(childDomRoot);
        } else if (_.isString(vChild) || _.isNumber(vChild)) {
          domRoot.textContent = vChild as string;
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
