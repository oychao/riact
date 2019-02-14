import * as _ from '../../utils/index';
import {
  ACTION_REMOVE,
  ACTION_INSERT,
  ACTION_REPLACE,
  ACTION_UPDATE_PROPS,
  ACTION_REORDER
} from '../../constants/index';
import VirtualNode from './VirtualNode';

export const keyIdxMapFac = function(
  list: Array<VirtualNode>,
  key: string
): Map<string, number> {
  const result: Map<string, number> = new Map<string, number>();
  for (let i = 0; i < list.length; i++) {
    result.set(list[i][key], i);
  }
  return result;
};

export const flatternListNode = function(
  list: Array<VirtualNode>
): Array<VirtualNode> {
  if (!_.isArray(list)) {
    return;
  }
  return list.reduce((acc: Array<VirtualNode>, child: VirtualNode): Array<
    VirtualNode
  > => {
    return acc.concat(
      child.isListNode()
        ? flatternListNode(child.children as Array<VirtualNode>)
        : child
    );
  }, []);
};

export const makeRemoveAction = function(index: number): Riact.TPatch {
  return {
    action: ACTION_REMOVE,
    payload: {
      index
    }
  };
};

export const makeInsertAction = function(
  index: number,
  item: VirtualNode
): Riact.TPatch {
  return {
    action: ACTION_INSERT,
    payload: {
      index,
      item
    }
  } as Riact.TPatch;
};

export const makeReplaceAction = function(item: VirtualNode): Riact.TPatch {
  return {
    action: ACTION_REPLACE,
    payload: item
  } as Riact.TPatch;
};

export const makeUpdatePropsAction = function(
  attributes: Riact.TObject,
  events: Riact.TFuncValObject
): Riact.TPatch {
  return {
    action: ACTION_UPDATE_PROPS,
    payload: {
      attributes,
      events
    }
  };
};

export const makeReorderAction = function(
  patches: Array<Riact.TPatch>
): Riact.TPatch {
  return {
    action: ACTION_REORDER,
    payload: patches
  };
};

export const createRef = (): Riact.TRef => {
  return {
    current: null
  };
};

export const loadStyle = (
  element: HTMLElement,
  styleObject: Riact.TObject
): void => {
  for (const styleKey in styleObject) {
    if (styleObject.hasOwnProperty(styleKey)) {
      const styleVal: string = styleObject[styleKey];
      (element as HTMLElement).style[styleKey] = styleVal;
    }
  }
};

export const loadDangerousInnerHTML = (element: HTMLElement, value: any): void => {
  if (_.isString(value)) {
    (element as HTMLElement).innerHTML = value;
  } else if (_.isFunction(value)) {
    (element as HTMLElement).innerHTML = value.call(null);
  } else {
    (element as HTMLElement).innerHTML = Object.prototype.toString.call(value);
  }
};
