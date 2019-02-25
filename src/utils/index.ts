export const latentSet = function(target: any, name: string, value: any): void {
  if (!target.hasOwnProperty(name)) {
    Object.defineProperty(target, name, {
      value,
      enumerable: false,
      configurable: false
    });
  }
};

export const applyMixins = function(
  derivedCtor: any,
  baseCtors: Array<any>
): void {
  baseCtors.forEach(
    (baseCtor: any): void => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(
        (name: string): void => {
          latentSet(derivedCtor.prototype, name, baseCtor.prototype[name]);
        }
      );
    }
  );
};

export const warning = function(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
};

export const isArray = Array.isArray;

export const isUndefined = function(object: any): boolean {
  return object === undefined;
};

export const isNull = function(object: any): boolean {
  return object === null;
};

export const isPlainObject = function(object: any) {
  return Object.prototype.toString.call(object) === '[object Object]';
};

export const isString = function(object: any): boolean {
  return typeof object === 'string';
};

export const isNumber = function(object: any): boolean {
  return typeof object === 'number';
};

export const isFunction = function(object: any): boolean {
  return typeof object === 'function';
};

export const isEqualObject = function(
  object: Riact.TObject,
  other: Riact.TObject
): boolean {
  if (isPlainObject(object) && isPlainObject(other)) {
    const entries1: Array<[string, string]> = Object.entries(object);
    const entries2: Array<[string, string]> = Object.entries(other);
    if (entries1.length !== entries2.length) {
      return false;
    }
    for (let i = 0; i < entries1.length; i++) {
      const [k1, v1]: [string, string] = entries1[i];
      const [k2, v2]: [string, string] = entries2[i];
      if (k1 !== k2 || v1 !== v2) {
        return false;
      }
    }
    return true;
  }
  return false;
};

export const isEqualArray = function(array: Array<any>, other: Array<any>) {
  if (isArray(array) && isArray(other) && array.length === other.length) {
    for (let i = 0; i < array.length; i++) {
      if (!Object.is(array[i], other[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
};

export const pick = function(
  object: Riact.TObject,
  keys: string | Array<string>
): Riact.TObject {
  keys = isString(keys) ? (keys as string).split(' ') : keys;
  return (keys as Array<string>).reduce(
    (acc: Riact.TObject, key: string): Riact.TObject => {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        acc[key] = object[key];
      }
      return acc;
    },
    {}
  );
};

export const omit = function(
  object: Riact.TObject,
  keys: string | Array<string>
): Riact.TObject {
  const result: Riact.TObject = Object.assign({}, object);
  keys = isString(keys) ? (keys as string).split(' ') : keys;
  (keys as Array<string>).forEach(
    (key: string): void => {
      delete result[key];
    }
  );
  return result;
};

/**
 * flatten a multiple demension array
 * @param arr multiple demension array
 * @deprecated
 * !Array.prototype.flat is a better option
 */
export const flattenArray = function(arr: Array<any>): Array<any> {
  return arr.reduce((acc: Array<any>, sub: any): Array<any> => {
    return acc.concat(isArray(sub) ? flattenArray(sub) : sub);
  }, []);
};

/**
 * depth first search algorithm
 * @param node tree object
 * @param key children key name
 * @param handler hanlder function that will be run on every node
 * @param index index of current node
 * @param parentNode parent node
 */
export const dfsWalk = function(
  node: Riact.TObject,
  key: string,
  handler: Riact.TFunction,
  index: number = 0,
  parentNode: Riact.TObject = null
): void {
  if (isNull(node)) {
    return;
  }
  if (!handler.call(null, node, index, parentNode)) {
    return;
  }
  const children: Array<Riact.TObject> = node[key] as Array<Riact.TObject>;
  if (children && isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const child: Riact.TObject = children[i];
      dfsWalk(child, key, handler, i, node);
    }
  }
};

/**
 * calculate longest increasing subsequence (only for positive numbers)
 * @param arr array of number
 */
export const calcLis = function(arr: Array<number>): Array<number> {
  const M: Array<number> = [-1];
  const P: Array<number> = [];
  const S: Array<number> = [];
  let i: number;
  let left: number;
  let right: number;
  let mid: number;
  let len: number;
  for (i = 0, len = arr.length; i < len; i++) {
    // skip negative numbers
    if (arr[i] < 0) {
      continue;
    }
    left = 1;
    right = M.length;
    while (left < right) {
      mid = Math.floor((left + right) / 2);
      if (arr[M[mid]] < arr[i]) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    M[left] = i;
    P[i] = M[left - 1];
  }

  len = M.length - 1;
  i = M[len];
  while (i !== -1) {
    S[len-- - 1] = arr[i];
    i = P[i];
  }
  return S;
};

/**
 * deep clone a object or an array
 * @param o value to be cloned
 */
export function deepClone (o: any): any {
  if (Array.isArray(o)) {
    return o.map((v: any): any => deepClone(v));
  } else if (typeof o === 'object') {
    return deepCloneObject(o, new WeakSet<Riact.TObject>());
  } else {
    return o;
  }
};
function deepCloneObject (o: Riact.TObject, ws: WeakSet<Riact.TObject>): Riact.TObject {
  if (o === null) {
    return null;
  } else if (ws.has(o)) {
    // break loop object
    return undefined;
  }
  ws.add(o);
  const C: Riact.TObject = {};
  let k: string
  let v: any;
  for (k in o) {
    if (Object.prototype.hasOwnProperty.call(o, k)) {
      v = o[k];
      C[k] = typeof v === 'object' ? deepCloneObject(v, ws) : deepClone(v);
    }
  }
  return C;
};

/**
 * breadth first search algorithm
 * @param node tree object
 * @param key children key name
 * @param handler hanlder function that will be run on every node
 */
export const bfsWalk = function (node: Riact.TObject, key: string, handler: Riact.TFunction): void {
  type TWrapperedNodeForBFS = {
    node: Riact.TObject,
    index: number,
    parent: Riact.TObject
  };
  let i: number = 0;
	const ws: WeakSet<Riact.TObject> = new WeakSet<Riact.TObject>();
	const queue: Array<TWrapperedNodeForBFS> = [];
	ws.add(node);
  let currNode: TWrapperedNodeForBFS = {
    node,
    index: 0,
    parent: null
  };
	queue.push(currNode);
	while (currNode) {
    if (handler.call(null, currNode.node, currNode.index, currNode.parent)) {
      return;
    }
		if (Array.isArray(currNode.node[key])) {
			currNode.node[key].forEach(({ node: subNode }: TWrapperedNodeForBFS, idx: number): void => {
				if (!ws.has(subNode)) {
					queue.push({
            node: subNode,
            index: idx,
            parent: currNode
          });
				};
			});
    }
    currNode = queue[++i];
	}
};
