import * as _ from '../../utils/index';

import Patchable from './Patchable';
import VirtualNode from './VirtualNode';
import { PROP_CHILDREN } from 'src/constants/index';

export default class PatchReorderLisBasedDiff extends Patchable {
  constructor(target: VirtualNode, patchData: Riact.TPatch) {
    super(target, patchData);
  }

  public run(): void {
    const listNode: VirtualNode = this.target;
    const { removes, moves, insertions, tailsInss }: Riact.TPatchReorderPayload = this.patchData.payload as Riact.TPatchReorderPayload;
    let startNode: VirtualNode = listNode[PROP_CHILDREN][0];
    let target: VirtualNode;
    let prevPivot: VirtualNode = null;
    let pivot: VirtualNode;
    let i: number, len: number;

    // a list for move target nodes, a map for prev nodes of which and a list for destination nodes
    // prev nodes could be updated while processing deleting and moving
    const toBeMovedNodeList: Array<VirtualNode> = [];
    const destinationNodeList: Array<VirtualNode> = [];
    const nodePrevNodeMap: WeakMap<VirtualNode, VirtualNode> = new WeakMap<VirtualNode, VirtualNode>();
    for (i = 0, len = moves.length; i < len; i++) {
      const { item, to } = moves[i];
      target = (item === undefined ? startNode : item.nextSibling) as VirtualNode;
      toBeMovedNodeList.push(target);
      destinationNodeList.push(to as VirtualNode);
      nodePrevNodeMap.set(target, item as VirtualNode);
    }

    // handle remove actions
    while (removes.length) {
      const prevNode: VirtualNode = removes.pop() as VirtualNode;
      let toBeRemoved: VirtualNode;
      if (_.isUndefined(prevNode)) {
        toBeRemoved = listNode[PROP_CHILDREN][0];
        startNode = startNode.nextSibling;
        if (nodePrevNodeMap.has(startNode)) {
          nodePrevNodeMap.set(startNode, null);
        }
      } else {
        toBeRemoved = prevNode.nextSibling;
        prevNode.nextSibling = prevNode.nextSibling.nextSibling;
        if (nodePrevNodeMap.has(prevNode.nextSibling)) {
          nodePrevNodeMap.set(prevNode.nextSibling, prevNode);
        }
      }
      toBeRemoved.unmountFromDom();
    }

    // handle move actions
    for (i = 0, len = destinationNodeList.length; i < len; i++) {
      const destination: VirtualNode = destinationNodeList[i];
      const toBeMovedNode: VirtualNode = toBeMovedNodeList[i];
      const prevNode: VirtualNode = nodePrevNodeMap.get(toBeMovedNode);

      if (_.isUndefined(prevNode)) {
        startNode = toBeMovedNode.nextSibling;
      } else {
        prevNode.nextSibling = prevNode.nextSibling.nextSibling;
        if (nodePrevNodeMap.has(prevNode.nextSibling)) {
          nodePrevNodeMap.set(prevNode.nextSibling, prevNode);
        }
      }
      if (_.isUndefined(destination)) {
        toBeMovedNode.nextSibling = startNode;
        startNode = toBeMovedNode;
      } else {
        toBeMovedNode.nextSibling = destination.nextSibling as VirtualNode;
        if (nodePrevNodeMap.has(destination.nextSibling as VirtualNode)) {
          nodePrevNodeMap.set(destination.nextSibling as VirtualNode, toBeMovedNode);
        }
        destination.nextSibling = toBeMovedNode;
      }
      // mount to dom
      if (toBeMovedNode.isListNode() || toBeMovedNode.isComponentNode()) {
        const domChildrenVNodes: Array<
          VirtualNode
        > = toBeMovedNode.getDomChildrenVNodes();
        for (const vNode of domChildrenVNodes) {
          vNode.mountToDom();
        }
      } else {
        toBeMovedNode.mountToDom();
      }
    }

    // handle insertions between normal nodes
    pivot = startNode;
    while (pivot) {
      const newNodes: Array<VirtualNode> = insertions.get(pivot) as Array<VirtualNode>;
      if (newNodes && newNodes.length) {
        newNodes[0].nextSibling = pivot;
        newNodes[0].parentNode = listNode;
        newNodes[0].reflectDescendantsToDom();
        for (i = 1, len = newNodes.length; i < len; i++) {
          newNodes[i].nextSibling = newNodes[i - 1];
          newNodes[i].parentNode = listNode;
          newNodes[i].reflectDescendantsToDom();
        }
        if (_.isNull(prevPivot)) {
          startNode = newNodes[newNodes.length - 1];
        } else {
          prevPivot.nextSibling = newNodes[i - 1];
        }
      }
      prevPivot = pivot;
      pivot = pivot.nextSibling;
    }

    // handle tail insertions
    // use prevPivot as the start node
    for (i = tailsInss.length - 1, len = 0; i > len; i--) {
      tailsInss[i].nextSibling = tailsInss[i - 1];
      tailsInss[i].parentNode = listNode;
      (tailsInss[i] as VirtualNode).reflectDescendantsToDom();
    }
    if (tailsInss.length) {
      tailsInss[0].parentNode = listNode;
      (tailsInss[0] as VirtualNode).reflectDescendantsToDom();
      if (_.isNull(prevPivot)) {
        startNode = tailsInss[tailsInss.length - 1] as VirtualNode;
      } else {
        prevPivot.nextSibling = tailsInss[tailsInss.length - 1] as VirtualNode;
      }
    }

    const newChildren: Array<VirtualNode> = [];
    pivot = startNode;
    while (pivot) {
      newChildren.push(pivot);
      pivot = pivot.nextSibling;
    }
    listNode.children = newChildren;

    listNode.clearPatchable();
  }
}
