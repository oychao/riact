const latentSet = function(target: any, name: string, value: any): void {
  Object.assign(target, name, {
    value,
    enumarable: false
  });
};

const applyMixins = function (derivedCtor: any, baseCtors: Array<any>): void {
  baseCtors.forEach((baseCtor: any): void => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      latentSet(derivedCtor.prototype, name, baseCtor.prototype[name]);
    });
  });
}

export default {
  latentSet,
  applyMixins,
};
