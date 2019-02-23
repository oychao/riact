import * as _ from '../../utils/index';

import Patchable from './Patchable';
import VirtualNode from './VirtualNode';
import {
  PROP_CHILDREN,
  ACTION_INSERT,
  ACTION_REMOVE_NEXT,
  ACTION_MOVE
} from 'src/constants/index';

export default class PatchReorderLisBasedDiff extends Patchable {
  constructor(target: VirtualNode, patchData: Riact.TPatch) {
    super(target, patchData);
  }

  public run(): void {
    const target: VirtualNode = this.target;
    const { payload }: Riact.TPatch = this.patchData;
    let startNode: VirtualNode = target[PROP_CHILDREN][0];
    for (const patch of payload as Array<Riact.TPatch>) {
      const { type, payload: reorderPayload }: Riact.TPatch = patch;
      if (type === ACTION_INSERT) {
        // handle insert
        const {
          index,
          item,
          to
        }: Riact.TPatchInsertPayload = reorderPayload as Riact.TPatchInsertPayload;
        if (!_.isUndefined(to)) {
          item.nextSibling = to.nextSibling;
          to.nextSibling = item;
        } else if (index === 0) {
          item.nextSibling = startNode;
          startNode = item as VirtualNode;
        }
        (item as VirtualNode).parentNode = target;
        (item as VirtualNode).reflectDescendantsToDom();
      } else if (type === ACTION_REMOVE_NEXT) {
        // handle remove
        let toBeRemoved: VirtualNode;
        if (_.isUndefined(reorderPayload)) {
          toBeRemoved = target[PROP_CHILDREN][0];
          startNode = target[PROP_CHILDREN][1];
        } else {
          toBeRemoved = (reorderPayload as VirtualNode).nextSibling;
          (reorderPayload as VirtualNode).nextSibling = (reorderPayload as VirtualNode).nextSibling.nextSibling;
        }
        toBeRemoved.unmountFromDom();
      } else if (type === ACTION_MOVE) {
        // handle move
        const {
          item,
          to
        }: Riact.TPatchInsertPayload = reorderPayload as Riact.TPatchInsertPayload;
        let target: VirtualNode;
        // reorder child chain
        if (_.isUndefined(item)) {
          target = startNode;
          startNode = startNode.nextSibling;
        } else {
          target = item.nextSibling as VirtualNode;
          item.nextSibling = target.nextSibling;
        }
        if (_.isUndefined(to)) {
          target.nextSibling = startNode;
          startNode = target;
        } else {
          target.nextSibling = to.nextSibling as VirtualNode;
          to.nextSibling = target;
        }
        // mount to dom
        if (target.isListNode() || target.isComponentNode()) {
          const domChildrenVNodes: Array<
            VirtualNode
          > = target.getDomChildrenVNodes();
          for (const vNode of domChildrenVNodes) {
            vNode.mountToDom();
          }
        } else {
          target.mountToDom();
        }
      }
    }
    const newChildren: Array<VirtualNode> = [];
    let pivot: VirtualNode = startNode;
    while (pivot) {
      newChildren.push(pivot);
      pivot = pivot.nextSibling;
    }
    target.children = newChildren;

    target.clearPatchable();
  }
}
