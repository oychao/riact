import * as _ from '../../utils/index';

export enum diffType {
  REPLACE,
  REORDER,
  UPDATE
}

const treeDiff = function(prevTree: JSX.Element, nextTree: JSX.Element): Array<common.TPatch> {
  const result: Array<common.TPatch> = [];
  
  if (_.isNull(prevTree)) {
    
  }
  
  return result;
};

const dfsWalk = function(prevNode: JSX.Element, nextTree: JSX.Element) {
  if (_.isNull(prevNode)) {
    
  }
};

export default treeDiff;
