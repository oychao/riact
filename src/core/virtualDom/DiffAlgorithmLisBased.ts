import * as _ from '../../utils/index';
import Diffable from './Diffable';
import VirtualNode from './VirtualNode';
import {
  PROP_KEY,
  ACTION_REORDER
} from 'src/constants/index';

/**
 * Longest Increasing Subsequence based keyed list diff algorithm, LIS helped to make
 * unneccesary node moves at maximum degree.
 */
export default class DiffAlgorithmLisBased extends Diffable {
  constructor() {
    super();
  }

  /**
   * trim same elements for two arrays, return deviation counts of beginning and ending
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
      this.run(list1[idx1], list2[idx2]);
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
      this.run(list1[idx1], list2[idx2]);
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
    const [sd, ed]: [number, number] = this.trimTwoLists(list1, list2, key);
    const pTailsIn: Array<VirtualNode> = []; // tail insertions
    const pMovs: Array<{
      item: JSX.Element;
      to: JSX.Element;
    }> = []; // move patches
    const pRmvs: Array<VirtualNode> = []; // remove patches
    const pInss: Map<VirtualNode, Array<VirtualNode>> = new Map<
      VirtualNode,
      Array<VirtualNode>
    >();
    const IM: Map<string, number> = new Map<string, number>(); // index map of length1
    const IT: Array<number> = new Array(len2 - sd - ed).fill(-1); // index table of length2
    let LIS: Array<number>; // longest increasing subsequence of index table
    let shouldMoved: boolean = false; // no need to move if LIS.length == IT.length(positive numbers only)
    let i: number,
      j: number,
      k: number,
      end: number,
      last: number,
      patches: Array<VirtualNode>;
    for (i = sd, end = len2 - ed; i < end; i++) {
      IM.set(list2[i].key, i);
    }
    last = -1;
    for (i = sd, end = len1 - ed; i < end; i++) {
      j = IM.get(list1[i].key);
      if (j !== undefined) {
        this.run(list1[i], list2[j]);
        IT[j - sd] = i;
        if (j < last) {
          shouldMoved = true;
        } else {
          last = j;
        }
      } else {
        pRmvs.push(list1[i - 1]);
      }
    }
    LIS = _.calcLis(IT); // calculate LIS of old list index table
    last = IT.length;
    for (i = len2 - ed - 1, j = LIS.length - 1, end = sd - 1; i > end; i--) {
      k = i - sd;
      if (IT[k] === -1) {
        if (last !== IT.length) {
          if (pInss.has(list1[IT[last]])) {
            patches = pInss.get(list1[IT[last]]);
          } else {
            patches = [];
            pInss.set(list1[IT[last]], patches);
          }
          patches.push(list2[i]);
        } else if (ed !== 0) {
          // put tail insertions into header node of trimed tail list
          if (pInss.has(list1[len1 - ed])) {
            patches = pInss.get(list1[len1 - ed]);
          } else {
            patches = [];
            pInss.set(list1[len1 - ed], patches);
          }
          patches.push(list2[i]);
        } else {
          pTailsIn.push(list2[i]);
        }
      } else if (shouldMoved) {
        if (j < 0 || LIS[j] !== IT[k]) {
          pMovs.push({
            to: LIS[j] === undefined ? (sd === 0 ? undefined : list1[sd - 1]) : list1[LIS[j]],
            item: list1[IT[k] - 1]
          });
        } else {
          j--;
        }
      }
      last = IT[k] === -1 ? last : k;
    }
    return {
      type: ACTION_REORDER,
      payload: {
        removes: pRmvs,
        moves: pMovs,
        insertions: pInss,
        tailsInss: pTailsIn
      }
    };
  }
}
