export enum diffType {
  REPLACE,
  REORDER,
  UPDATE
}

const treeDiff = function(prevTree: JSX.Element, nextTree: JSX.Element): Array<common.TPatch> {
  const result: Array<common.TPatch> = [];
  
  if (prevTree.tagType) {
    
  }
  
  return result;
};

export default treeDiff;
