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

export const makeUpdatePropsAction = function(index: number, props: common.TLvl1JSON): common.TPatch {
  return {
    action: ACTION_UPDATE_PROPS,
    payload: props
  };
};

export const createDomElements = function(vnode: JSX.Element): HTMLElement {
  const node: HTMLElement = document.createElement(vnode.tagType);
  
  for (const key in vnode.attributes) {
    if (vnode.attributes.hasOwnProperty(key)) {
      const value = vnode.attributes[key];
      node.setAttribute(key, value);
    }
  }
  
  if (_.isArray(vnode.children)) {
    const children: Array<JSX.Element | string> = _.flatten(vnode.children);
    for (const vChild of children) {
      if (_.isPlainObject(vChild)) {
        const child = createDomElements(vChild as JSX.Element);
        node.appendChild(child);
      } else if (_.isString(vChild) || _.isNumber(vChild)) {
        node.textContent = vChild as string;
      }
    }
  }
  
  return node;
};
