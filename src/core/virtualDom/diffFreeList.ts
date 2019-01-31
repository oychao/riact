import * as _ from '../../utils/index';

import { makeReplaceAction } from './domUtils';

const diffFreeList = function(oldList: Array<JSX.Element>, newList: Array<JSX.Element>): Array<common.TPatch> {
  const actions: Array<common.TPatch> = [];
  
  _.warning(oldList.length === newList.length, 'calculating invalid free list difference, length unequaled');
  
  for (let i = 0; i < oldList.length; i++) {
    const oldItem: JSX.Element = oldList[i];
    const newItem: JSX.Element = newList[i];
    
    // if (oldItem.tagType ! == newItem.tagType) {
    //   actions.push(makeReplaceAction(i, newItem));
    // } else {
    // }
    
    // to be done
  }
  
  return actions;
};

export default diffFreeList;
