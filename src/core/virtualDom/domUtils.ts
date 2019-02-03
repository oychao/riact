import * as _ from '../../utils/index';
import {
  ACTION_REMOVE,
  ACTION_INSERT,
  ACTION_REPLACE,
  ACTION_UPDATE_PROPS,
  NODE_TYPE_EMPTY
} from '../../constants/index';
import VirtualNode from '../VirtualNode';

export const keyIdxMapFac = function(list: Array<VirtualNode>, key: string): Map<string, number> {
  const result: Map<string, number> = new Map<string, number>();
  for (let i = 0; i < list.length; i++) {
    result.set(list[i].key, i);
  }
  return result;
};

export const flatternListNode = function(list: Array<VirtualNode>): Array<VirtualNode> {
  if (!_.isArray(list)) {
    return;
  }
  return list.reduce((acc: Array<VirtualNode>, child: VirtualNode): Array<VirtualNode> => {
    return acc.concat(child.isListNode() ? flatternListNode(child.children as Array<VirtualNode>) : child);
  }, []);
};

export const makeRemoveAction = function(index: number): common.TPatch {
  return {
    action: ACTION_REMOVE,
    payload: index
  };
};

export const makeInsertAction = function(index: number, item: VirtualNode): common.TPatch {
  return {
    action: ACTION_INSERT,
    payload: {
      index,
      item
    }
  };
};

export const makeReplaceAction = function(item: VirtualNode): common.TPatch {
  return {
    action: ACTION_REPLACE,
    payload: item
  };
};

export const makeUpdatePropsAction = function(props: common.TStrValObject): common.TPatch {
  return {
    action: ACTION_UPDATE_PROPS,
    payload: props
  };
};

// import * as _ from '../../utils/index';
// import {
//   keyIdxMapFac,
//   makeRemoveAction,
//   makeInsertAction,
//   makeReplaceAction,
//   makeUpdatePropsAction,
//   flatternListNode,
//   createEmptyNode
// } from './domUtils';
// import { ACTION_REPLACE, ACTION_UPDATE_PROPS, ACTION_INSERT, ACTION_REORDER, ACTION_REMOVE } from '../../constants/index';
// import Context from '../../core/Context';
// import Component from '../component/component';
// import VirtualNode from '../VirtualNode';

// export default class VirtualDomMixin implements common.IComponent {
//   public context: Context;
//   public stateNode: VirtualNode;
//   public virtualDom: VirtualNode;
  
//   public setContext(context: Context): void {
//     this.context = context;
//   }
  
//   public setStateNode(stateNode: VirtualNode): void {
//     this.stateNode = stateNode;
//   }
  
//   public renderDomElements(vRoot: VirtualNode, vNode: VirtualNode): VirtualNode {
//     let node: Text | HTMLElement | Component = null;
    
//     if (_.isNull(vNode)) {
//       return null;
//     }
    
//     vNode.parentNode = vRoot;
    
//     const { tagType, attributes, children } = vNode;
//     if (vNode.isComponentNode()) {
//       const compRender: common.TFuncComponent = (tagType as common.TFuncComponent);
//       const TargetComponent: typeof Component = this.context.getComponent(compRender);
//       vNode.attributes.children = children;
//       vNode.children = [];
//       node = new TargetComponent(attributes, vNode);
//       node.setContext(this.context);
//     } else if (vNode.isBasicValueNode()) {
//       node = document.createTextNode(vNode.value) as Text;
//     } else if (vNode.isEmptyNode()) {
//       return vNode;
//     } else if (vNode.isDomNode()) {
//       node = document.createElement(vNode.tagType as string);
//       for (const key in vNode.attributes) {
//         if (vNode.attributes.hasOwnProperty(key)) {
//           const value = vNode.attributes[key];
//           node.setAttribute(key, value);
//         }
//       }
//     }
//     vNode.el = node;
//     vNode.mountToDom();
    
//     if (_.isArray(vNode.children) && ! vNode.isComponentNode()) {
//       for (const child of vNode.children) {
//         this.renderDomElements(vNode, child);
//       }
//     }
    
//     return vNode;
//   };
  
//   public diffFreeList (oldList: Array<VirtualNode>, newList: Array<VirtualNode>): Array<common.TPatch> {
//     const actions: Array<common.TPatch> = [];
    
//     _.warning(oldList.length === newList.length, 'calculating invalid free list difference, length unequaled');
    
//     for (let i = 0; i < oldList.length; i++) {
//       this.diffTree(oldList[i], newList[i]);
//     }
    
//     return actions;
//   }
  
//   public diffTree (oldVDom: VirtualNode, newVDom: VirtualNode): void {
//     if (oldVDom.isEmptyNode() && newVDom.isEmptyNode()) {
//       return;
//     }
    
//     if (!oldVDom.sameTypeWith(newVDom) || oldVDom.isEmptyNode() || newVDom.isEmptyNode()) {
//       oldVDom.patch = makeReplaceAction(newVDom);
//     } else if (oldVDom.isBasicValueNode() && newVDom.isBasicValueNode()) {
//       if (oldVDom.value !== newVDom.value) {
//         oldVDom.patch = makeReplaceAction(newVDom);
//       }
//     } else {
//       const { tagType: oldTagType, attributes: oldAttributes, children: oldChildren } = oldVDom as VirtualNode;
//       const { tagType: newTagType, attributes: newAttributes, children: newChildren } = newVDom as VirtualNode;
//       if (oldTagType !== newTagType) {
//         oldVDom.patch = makeReplaceAction(newVDom);
//         return;
//       } else if (!_.isEqualObject(oldAttributes, newAttributes)) {
//         oldVDom.patch = makeUpdatePropsAction(newAttributes);
//       }
      
//       this.diffFreeList(oldChildren, newChildren);
//     }
//   }
  
//   public reconcile(): void {
//     _.dfsWalk(this.virtualDom, 'children', (node: VirtualNode): boolean => {
//       if (!node.patch) {
//         return true;
//       }
//       const { action, payload }: common.TPatch = node.patch;
//       if (action === ACTION_REPLACE) {
//         this.virtualDom = this.renderDomElements(this.stateNode, payload as VirtualNode);
//         this.stateNode.children[0] = this.virtualDom;
//       } else if (action === ACTION_UPDATE_PROPS) {
//       } else if (action === ACTION_REORDER) {
//       } else if (action === ACTION_REMOVE) {
//         this.stateNode.children[0] = createEmptyNode(null);
//       }
//       delete node.patch;
//       return true;
//     });
//   }
  
//   public render: common.TFuncComponent;
// };
