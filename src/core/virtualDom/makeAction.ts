import { ACTION_REMOVE, ACTION_INSERT } from '../../constants/index';

export const makeRemoveAction = function(index: number): common.TListDiffAction {
  return {
    action: ACTION_REMOVE,
    payload: index
  };
};

export const makeInsertAction = function(index: number, item: common.TObject): common.TListDiffAction {
  return {
    action: ACTION_INSERT,
    payload: {
      index,
      item
    }
  };
};