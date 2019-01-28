const keyIdxMapFac = function(list: Array<common.TObject>, key: string): Map<string, number> {
  const result: Map<string, number> = new Map<string, number>();
  for (let i = 0; i < list.length; i++) {
    result.set(list[i][key], i);
  }
  return result;
};

const pushRemoveAction = function(actions: Array<common.TListDiffAction>, index: number): void {
  actions.push({
    action: 'REMOVE',
    payload: index
  });
};

const pushInsertAction = function(actions: Array<common.TListDiffAction>, index: number, item: common.TObject): void {
  actions.push({
    action: 'INSERT',
    payload: {
      index,
      item
    }
  });
};

const listDiff = function(oldList: Array<common.TObject>, newList: Array<common.TObject>, key: string): Array<common.TListDiffAction> {
  const actions: Array<common.TListDiffAction> = [];
  
  const oldKeyIdxMap: Map<string, number> = keyIdxMapFac(oldList, key);
  const newKeyIdxMap: Map<string, number> = keyIdxMapFac(newList, key);
  
  const reservedOldList: Array<common.TObject> = [];
  
  let i;
  let j;
  
  // remove all items which no longer exists in new list
  for (i = 0; i < oldList.length; i++) {
    const item = oldList[i];
    if (newKeyIdxMap.has(item[key])) {
      reservedOldList.push(item);
    } else {
      pushRemoveAction(actions, i);
    }
  }
  
  i = 0;
  j = 0;
  while (i < newList.length) {
    const newItem = newList[i];
    const oldItem = reservedOldList[j];
    const nextOldItem = reservedOldList[j + 1];
    
    if (!oldItem || !oldKeyIdxMap.has(newItem[key])) {
      pushInsertAction(actions, i, newItem);
      i++;
      continue;
    }
    
    if (newItem[key] === oldItem[key]) {
      j++;
      i++;
    } else {
      if (nextOldItem && nextOldItem[key] === newItem[key]) {
        pushRemoveAction(actions, i);
        j++;
      } else {
        pushInsertAction(actions, i, newItem);
        i++;
      }
    }
  }
  
  while(j < reservedOldList.length) {
    pushRemoveAction(actions, j);
    j++;
  }
  
  return actions;
};

export default listDiff;
