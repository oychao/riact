import VirtualNode from './VirtualNode';

/**
 * Diffable abstract class, any class extends this class shall implement the patch procedure
 * method(run), the child class will later be injected into VirtualNode for reconciliation.
 * A static factory method is provided to get pooled patchable procedure instance, patch data
 * shall be set before running.
 * This design is for code decoupling.
 */
abstract class Patchable {
  public static getInstance(
    Clazz: { new (...args: Array<any>): Patchable },
    target: VirtualNode,
    patchData: Riact.TPatch
  ): Patchable {
    return new Clazz().setTarget(target).setPatchData(patchData);
  }
  protected target: VirtualNode;
  protected patchData: Riact.TPatch;
  constructor() {}
  public abstract run(): void;
  public setTarget(target: VirtualNode): Patchable {
    this.target = target;
    return this;
  }
  public setPatchData(patchData: Riact.TPatch): Patchable {
    this.patchData = patchData;
    return this;
  }
}

export default Patchable;
