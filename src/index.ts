import './declarations';

import * as _ from './utils/index';
import * as domUtils from './core/virtualDom/domUtils';

import Context from './core/context/Context';
import VirtualNode from './core/virtualDom/VirtualNode';
import StaticContext from './core/context/StaticContext';
import Component from './core/component/Component';

export default class React extends Context implements common.IComponent {
  
  public static createContext = Context.createContext;
  public static createElement = VirtualNode.createElement;
  public static createRef = domUtils.createRef;
  public static memo = Component.memo;
  public static useState = StaticContext.useState;

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

export const useState = StaticContext.useState;
