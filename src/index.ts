import './declarations';

import * as _ from './utils/index';
import * as domUtils from './core/virtualDom/domUtils';

import StaticContext from './core/context/StaticContext';
import AppContext from './core/context/AppContext';
import Context from './core/context/Context';
import VirtualNode from './core/virtualDom/VirtualNode';
import Component from './core/component/Component';

export default class Riact extends AppContext implements Riact.IComponent {
  public static createContext = Context.createContext;
  public static createElement = VirtualNode.createElement;
  public static createRef = domUtils.createRef;
  public static memo = Component.memo;
  public static useState = StaticContext.useState;
  public static useEffect = StaticContext.useEffect;
  public static useContext = StaticContext.useContext;

  public static render(virtualNode: JSX.Element, rootDom: HTMLElement) {
    rootDom.innerHTML = '';
    return new Riact(virtualNode as VirtualNode, rootDom);
  }

  constructor(virtualNode: VirtualNode, rootDom: HTMLElement) {
    super();
    _.warning(!_.isNull(virtualNode), 'empty virtual dom');
    _.warning(rootDom instanceof HTMLElement, 'invalid root dom element');

    this.appContext = this;
    this.virtualNode = virtualNode;

    // the mounted dom pointer is a virtual node as well
    const rootNode: VirtualNode = new VirtualNode();
    rootNode.tagType = rootDom.tagName;
    rootNode.el = rootDom;

    // basicly the class Riact is a special function component, the root
    // component, which always return same virtual dom in render
    this.virtualNode = new VirtualNode();
    rootNode.children = [this.virtualNode];
    this.virtualNode.tagType = () => this.virtualNode;
    this.virtualNode.el = this;
    this.virtualNode.parentNode = rootNode;

    // mount a empty component onto root component, it will be replaced in
    // the first reconciliation
    const emptyNode = VirtualNode.createEmptyNode();
    this.virtualNode.children = [emptyNode];
    emptyNode.parentNode = this.virtualNode;

    this.batchingUpdate(() => {
      this.pushDirtyComponent(this);
      VirtualNode.diffTree(emptyNode, virtualNode);
    }, this);
  }

  public reflectToDom(): void {
    this.virtualNode.children[0].reconcile();
  }

  public virtualNode: VirtualNode;
  public readonly appContext: AppContext;
  public render(): JSX.Element {
    return this.virtualNode;
  }
  public getAppContext(): Riact.IAppContext {
    return this;
  }
}

export const useState = StaticContext.useState;
export const useEffect = StaticContext.useEffect;
export const useContext = StaticContext.useContext;
