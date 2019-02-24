import Diffable from './Diffable';
import VirtualNode from './VirtualNode';
import { keyIdxMapFac, makeRemoveAction, makeInsertAction } from './domUtils';
import { ACTION_REORDER_BEFORE_16 } from 'src/constants/index';

/**
 * !meant to be keyed list diff algorithm before React 16, bad implementation with bugs
 * @deprecated
 */
export default class DiffAlgorithmBefore16 extends Diffable {
  constructor() {
    super();
  }
  
  protected diffKeyedList(list1: Array<VirtualNode>, list2: Array<VirtualNode>, key: string): Riact.TPatch {
    const actions: Array<Riact.TPatch> = [];
    
    const oldKeyIdxMap: Map<string, number> = keyIdxMapFac(list1, key);
    const newKeyIdxMap: Map<string, number> = keyIdxMapFac(list2, key);
    
    const reservedOldList: Array<VirtualNode> = [];
    
    let i: number;
    let j: number;
    
    // remove all items which no longer exists in new list
    for (i = 0; i < list1.length; i++) {
      const item = list1[i];
      if (newKeyIdxMap.has(item.key)) {
        reservedOldList.push(item);
      } else {
        actions.push(makeRemoveAction(i - actions.length));
      }
    }
    
    i = 0;
    j = 0;
    while (i < list2.length) {
      const newItem = list2[i];
      const oldItem = reservedOldList[j];
      const nextOldItem = reservedOldList[j + 1];
      
      if (!oldItem || !oldKeyIdxMap.has(newItem.key)) {
        actions.push(makeInsertAction(i++, newItem));
        continue;
      }
      
      if (newItem.key === oldItem.key) {
        this.run(oldItem, newItem);
        j++;
        i++;
      } else {
        if (nextOldItem && nextOldItem.key === newItem.key) {
          actions.push(makeRemoveAction(i));
          j++;
        } else {
          actions.push(makeInsertAction(i++, newItem));
        }
      }
    }
    
    while (j < reservedOldList.length) {
      actions.push(makeRemoveAction(j));
      j++;
    }
    
    return {
      type: ACTION_REORDER_BEFORE_16,
      payload: actions
    };
  }
}
