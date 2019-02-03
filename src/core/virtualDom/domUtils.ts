import * as _ from '../../utils/index';
import {
  ACTION_REMOVE,
  ACTION_INSERT,
  ACTION_REPLACE,
  ACTION_UPDATE_PROPS,
  NODE_TYPE_EMPTY
} from '../../constants/index';
import VirtualNode from './VirtualNode';

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
