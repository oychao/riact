import * as _ from '../../utils/index';
import { ACTION_REMOVE, ACTION_INSERT, ACTION_REPLACE, ACTION_UPDATE_PROPS } from '../../constants/index';

export const makeRemoveAction = function(index: number): common.TPatch {
  return {
    action: ACTION_REMOVE,
    payload: index
  };
};

export const makeInsertAction = function(index: number, item: common.TObject): common.TPatch {
  return {
    action: ACTION_INSERT,
    payload: {
      index,
      item
    }
  };
};

export const makeReplaceAction = function(index: number, item: common.TObject): common.TPatch {
  return {
    action: ACTION_REPLACE,
    payload: {
      index,
      item
    }
  };
};

export const makeUpdatePropsAction = function(index: number, props: common.TStrValObject): common.TPatch {
  return {
    action: ACTION_UPDATE_PROPS,
    payload: props
  };
};
