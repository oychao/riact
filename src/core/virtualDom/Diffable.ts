import * as _ from '../../utils/index';

import VirtualNode from './VirtualNode';
import { makeReplaceAction, makeUpdatePropsAction } from './domUtils';
import Component from '../component/Component';
import Patchable from './Patchable';
import PatchReplace from './PatchReplace';
import PatchUpdateProps from './PatchUpdateProps';
import PatchReorderLisBasedDiff from './PatchReorderLisBasedDiff';

/**
 * Diffable abstract class, any class extends this class shall implement keyed list algorithm,
 * the run method.
 * The child class will later be injected into VirtualNode for diff calculation.
 * A static factory method is provided to get pooled diffable algorithm instance.
 * This design is for code decoupling.
 */
abstract class Diffable {
  protected abstract diffKeyedList(list1: Array<VirtualNode>, list2: Array<VirtualNode>, key: string):
    Riact.TPatch;
  private static ClassInstMap: WeakMap<{ new (...args: Array<any>): Diffable }, Diffable>
    = new WeakMap<{ new (...args: Array<any>): Diffable }, Diffable>();
  public static getInstance(DiffableImpl: {new (...args: Array<any>): Diffable}): Diffable {
    if (Diffable.ClassInstMap.has(DiffableImpl)) {
      return Diffable.ClassInstMap.get(DiffableImpl);
    }
    let inst: Diffable = new DiffableImpl();
    Diffable.ClassInstMap.set(DiffableImpl, inst);
    return inst;
  }

  constructor() {}

  protected diffFreeList(
    oldList: Array<VirtualNode>,
    newList: Array<VirtualNode>
  ): void {
    _.warning(
      oldList.length === newList.length,
      'calculating invalid free list difference, length unequaled'
    );

    for (let i = 0; i < oldList.length; i++) {
      this.run(oldList[i], newList[i]);
    }
  }

  public run(oldVDom: VirtualNode, newVDom: VirtualNode, key: string = 'key'): void {
    if (oldVDom.isEmptyNode() && newVDom.isEmptyNode()) {
      return;
    }

    // difference has already been calculated
    if (oldVDom.hasPatchable()) {
      return;
    }

    if (
      !oldVDom.sameTypeWith(newVDom) ||
      oldVDom.isEmptyNode() ||
      newVDom.isEmptyNode()
    ) {
      oldVDom.setPatchable(Patchable.getInstance(PatchReplace, oldVDom, makeReplaceAction(newVDom)));
    } else if (oldVDom.isTextNode() && newVDom.isTextNode()) {
      if (oldVDom.value !== newVDom.value) {
        oldVDom.setPatchable(Patchable.getInstance(PatchReplace, oldVDom, makeReplaceAction(newVDom)));
      }
    } else {
      const {
        tagType: oldTagType,
        attributes: oldAttributes,
        children: oldChildren,
        events: oldEvents
      } = oldVDom as VirtualNode;
      const {
        tagType: newTagType,
        attributes: newAttributes,
        children: newChildren,
        events: newEvents
      } = newVDom as VirtualNode;
      if (oldTagType !== newTagType) {
        oldVDom.setPatchable(Patchable.getInstance(PatchReplace, oldVDom, makeReplaceAction(newVDom)));
        return;
      } else if (
        !_.isEqualObject(oldAttributes, newAttributes) ||
        !_.isEqualObject(oldEvents, newEvents) ||
        (_.isUndefined(oldAttributes) &&
          _.isUndefined(newAttributes) &&
          _.isUndefined(oldEvents) &&
          _.isUndefined(newEvents))
      ) {
        oldVDom.setPatchable(Patchable.getInstance(PatchUpdateProps, oldVDom, makeUpdatePropsAction(newAttributes, newEvents)));
      }
      if (oldVDom.isListNode() && newVDom.isListNode()) {
        oldVDom.setPatchable(Patchable.getInstance(PatchReorderLisBasedDiff, oldVDom, this.diffKeyedList(oldChildren, newChildren, key)));
      } else if (!oldVDom.isComponentNode() && !newVDom.isComponentNode()) {
        this.diffFreeList(oldChildren, newChildren);
      } else if (oldVDom.isComponentNode() && newVDom.isComponentNode()) {
        const comp: Component = oldVDom.el as Component;
        const prevProps: Riact.TObject = Object.assign({}, oldVDom.attributes);
        oldVDom.attributes = newVDom.attributes;
        oldVDom.events = newVDom.events;
        if (!comp.isWaitingContextProviderUpdate()) {
          comp.renderDom(prevProps);
        }
      }
    }
  }
};

export const DiffAlgorithmFactory = function(Algo: { new (...args: Array<any>): Diffable }): PropertyDecorator {
  return (target: VirtualNode, prop: string): void => {
    target[prop] = Diffable.getInstance(Algo);
  };
};

export default Diffable;
