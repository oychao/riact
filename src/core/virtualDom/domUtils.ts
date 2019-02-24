import * as _ from '../../utils/index';
import {
  ACTION_REMOVE,
  ACTION_INSERT,
  ACTION_REPLACE,
  ACTION_UPDATE_PROPS,
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
    type: ACTION_REMOVE,
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
    type: ACTION_INSERT,
    payload: {
      index,
      item
    }
  } as Riact.TPatch;
};

export const makeReplaceAction = function(item: VirtualNode): Riact.TPatch {
  return {
    type: ACTION_REPLACE,
    payload: item
  } as Riact.TPatch;
};

export const makeUpdatePropsAction = function(
  attributes: Riact.TObject,
  events: Riact.TFuncValObject
): Riact.TPatch {
  return {
    type: ACTION_UPDATE_PROPS,
    payload: {
      attributes,
      events
    }
  };
};

export const createRef = (): Riact.TRef => {
  return {
    current: null
  };
};

export const loadStyle = (
  element: HTMLElement,
  currStyle: Riact.TObject,
  prevStyle?: Riact.TObject
): void => {
  if (_.isPlainObject(prevStyle)) {
    for (const styleKey in prevStyle) {
      if (prevStyle.hasOwnProperty(styleKey)) {
        (element as HTMLElement).style[styleKey] = '';
      }
    }
  }
  for (const styleKey in currStyle) {
    if (currStyle.hasOwnProperty(styleKey)) {
      const styleVal: string = currStyle[styleKey];
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
