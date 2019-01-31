export const latentSet = function(target: any, name: string, value: any): void {
  Object.assign(target, name, {
    value,
    enumarable: false
  });
};

export const applyMixins = function (derivedCtor: any, baseCtors: Array<any>): void {
  baseCtors.forEach((baseCtor: any): void => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      latentSet(derivedCtor.prototype, name, baseCtor.prototype[name]);
    });
  });
}

export const isArray = Array.isArray;

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

export const isEqualObject = function(object: common.TStrValObject, other: common.TStrValObject): boolean {
  if (isPlainObject(object) && isPlainObject(other)) {
    const entries1: Array<[string, string]> = Object.entries(object);
    const entries2: Array<[string, string]> = Object.entries(other);
    if (entries1.length !== entries2.length) {
      return false;
    }
    for (let i = 0; i < entries1.length; i++) {
      const [k1, v1]: [string, string] = entries1[i];
      const [k2, v2]: [string, string] = entries1[i];
      if (k1 !== k2 || v1 !== v2) {
        return false;
      }
    }
    return true;
  }
  return false;
};

export const pick = function(object: common.TObject, keys: string | Array<string>): common.TObject {
  keys = isString(keys) ? (keys as string).split(' ') : keys;
  return (keys as Array<string>).reduce((acc: common.TObject, key: string): common.TObject  => {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      acc[key] = object[key];
    }
    return acc;
  }, {});
};

export const omit = function(object: common.TObject, keys: string | Array<string>): common.TObject {
  const result = Object.assign({}, object);
  keys = isString(keys) ? (keys as string).split(' ') : keys;
  (keys as Array<string>).forEach((key: string): void => {
    delete result[key];
  });
  return result;
}

export const flatten = function(arr: Array<any>): Array<any> {
  return arr.reduce((acc: Array<any>, sub: any): Array<any> => {
    return acc.concat(isArray(sub) ? flatten(sub) : sub);
  }, []);
};

export const warning = function(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
};
