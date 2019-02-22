import * as _ from '../../utils/index';
import Diffable from './Diffable';
import VirtualNode from './VirtualNode';
import { PROP_KEY, ACTION_REMOVE_NEXT, ACTION_INSERT, ACTION_MOVE, ACTION_REORDER } from 'src/constants/index';

export default class DiffAlgorithmLisBased extends Diffable {
  constructor() {
    super();
  }

  /**
   * trim same elements for two arrays, return deviation counts of beginning
   * and ending
   * @param list1 array of object
   * @param list2 array of object
   * @param key key name for identification
   */
  private trimTwoLists(
    list1: Array<VirtualNode>,
    list2: Array<VirtualNode>,
    key: string
  ): [number, number] {
    let sd: number = 0;
    let ed: number = 0;
    let idx1: number = 0,
      idx2: number = 0;
    const { length: len1 }: Array<VirtualNode> = list1;
    const { length: len2 }: Array<VirtualNode> = list2;
    while (sd < len1 && sd < len2 && list1[idx1][key] === list2[idx1][key]) {
      this.diffTree(list1[idx1], list2[idx2]);
      sd++;
      idx1 = sd;
      idx2 = sd;
    }
    idx1 = len1 - ed - 1;
    idx2 = len2 - ed - 1;
    while (
      sd + ed < len1 &&
      sd + ed < len2 &&
      list1[idx1][key] === list2[idx2][key]
    ) {
      this.diffTree(list1[idx1], list2[idx2]);
      ed++;
      idx1 = len1 - ed - 1;
      idx2 = len2 - ed - 1;
    }
    return [sd, ed];
  }

  /**
   * diff two arrays of number, Takes O(nlogn) time in expectation
   * @param list1 array of characters
   * @param list2 array of characters
   */
  public diffKeyedList(
    list1: Array<VirtualNode>,
    list2: Array<VirtualNode>,
    key: string = PROP_KEY
  ): Riact.TPatch {
    const { length: len1 }: Array<VirtualNode> = list1;
    const { length: len2 }: Array<VirtualNode> = list2;
    const [sd, ed]: [number, number] = this.trimTwoLists(
      list1,
      list2,
      key
    );
    const pHeaderIns: Array<VirtualNode> = []; // tail insertions
    const pMovs: Array<Riact.TPatch> = []; // move patches
    const pRmvs: Array<Riact.TPatch> = []; // remove patches
    const pInss: Map<VirtualNode, Array<Riact.TPatch>> = new Map<
      VirtualNode,
      Array<Riact.TPatch>
    >();
    const IM: Map<string, number> = new Map<string, number>(); // index map of length1
    const IT: Array<number> = new Array(len2 - sd - ed).fill(-1); // index table of length2
    let LIS: Array<number>; // longest increasing subsequence of index table
    let P: Array<Riact.TPatch>; // all patches
    let shouldMoved: boolean = false; // no need to move if LIS.length == IT.length(positive numbers only)
    let i: number,
      j: number,
      k: number,
      end: number,
      last: number,
      patches: Array<Riact.TPatch>,
      len: number; // other temp variables
    for (i = sd, end = len2 - ed; i < end; i++) {
      IM.set(list2[i].key, i);
    }
    last = -1;
    for (i = sd, end = len1 - ed; i < end; i++) {
      j = IM.get(list1[i].key);
      if (j !== undefined) {
        this.diffTree(list1[i], list2[j]);
        IT[j - sd] = i;
        if (j < last) {
          shouldMoved = true;
        } else {
          last = j;
        }
      } else {
        pRmvs.push({
          type: ACTION_REMOVE_NEXT,
          payload: list1[i - 1]
        });
      }
    }
    LIS = _.calcLis(IT);
    last = IT.length;
    for (i = len2 - ed - 1, j = LIS.length - 1, end = sd - 1; i > end; i--) {
      k = i - sd;
      if (IT[k] === -1) {
        if (LIS[j] !== undefined) {
          if (pInss.has(list1[IT[last]])) {
            patches = pInss.get(list1[IT[last]]);
          } else {
            patches = [];
            pInss.set(list1[IT[last]], patches);
          }
          patches.push({
            type: ACTION_INSERT,
            payload: {
              item: list2[i],
              to: list1[IT[last] - 1]
            }
          });
        } else {
          pHeaderIns.push(list2[i]);
        }
      } else if (shouldMoved) {
        if (j < 0 || LIS[j] !== IT[k]) {
          pMovs.push({
            type: ACTION_MOVE,
            payload: {
              to:
                IT[last] === undefined ? list1[len1 - 1] : list1[IT[last] - 1],
              item: list1[IT[i] - 1]
            }
          });
        } else {
          j--;
        }
      }
      last = IT[k] === -1 ? last : k;
    }

    P = [...pMovs, ...pRmvs];
    pInss.forEach((val: Array<Riact.TPatch>): void => {
      for (i = 0, len = val.length; i < len; i++) {
        P.push(val[i]);
      }
    });
    for (i = 0, len = pHeaderIns.length; i < len; i++) {
      P.push({
        type: ACTION_INSERT,
        payload: {
          index: sd === 0 ? 0 : undefined,
          item: pHeaderIns[i],
          to: sd === 0 ? undefined : list1[sd - 1]
        }
      });
    }
    
    return {
      type: ACTION_REORDER,
      payload: P
    };
  }
}
