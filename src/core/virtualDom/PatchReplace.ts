import * as _ from '../../utils/index';

import Patchable from './Patchable';
import VirtualNode from './VirtualNode';
import Component from '../component/Component';

export default class PatchReplace extends Patchable {
  constructor(target: VirtualNode, patchData: Riact.TPatch) {
    super(target, patchData);
  }

  public run (): void {
    const target: VirtualNode = this.target;
    const { payload }: Riact.TPatch = this.patchData;
    target.unmountFromDom();
    if (target.isComponentNode()) {
      (target.el as Component).unmount();
    } else if (!target.isEmptyNode() && !target.isTextNode()) {
      const comps: Array<Component> = target.getChildrenCompNodes();
      for (const comp of comps) {
        comp.unmount();
      }
    }
    this.loadAttributes(payload as VirtualNode);
    target.clearPatchable();
    target.reflectToDom();
    if (!target.isComponentNode() && _.isArray(target.children)) {
      for (const child of target.children) {
        child.reflectDescendantsToDom();
      }
    }
  }

  private loadAttributes(that: VirtualNode): void {
    const target: VirtualNode = this.target;
    target.tagType = that.tagType;
    target.attributes = that.attributes || {};
    target.children = that.children || [];
    target.events = that.events || {};
    if (_.isArray(target.children)) {
      for (const child of target.children) {
        child.parentNode = target;
      }
    }
    if (that.reserved) {
      target.reserved = that.reserved;
    } else {
      delete target.reserved;
    }
    if (!_.isUndefined(that.value) && !_.isNull(that.value)) {
      target.value = that.value;
    } else {
      delete target.value;
    }
    delete target.el;
  }
}
