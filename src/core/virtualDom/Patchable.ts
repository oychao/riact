import VirtualNode from './VirtualNode';

/**
 * Diffable abstract class, any class extends this class shall implement the patch procedure
 * method(run), the child class will later be injected into VirtualNode for reconciliation.
 * A static factory method is provided to get patchable procedure instance, target node and
 * patch data shall be passed when running.
 * This design is for code decoupling.
 */
abstract class Patchable {
  public static getInstance(
    Clazz: { new (...args: Array<any>): Patchable },
    target: VirtualNode,
    patchData: Riact.TPatch
  ): Patchable {
    return new Clazz(target, patchData);
  }
  protected target: VirtualNode;
  protected patchData: Riact.TPatch;
  constructor(target: VirtualNode, patchData: Riact.TPatch) {
    this.target = target;
    this.patchData = patchData;
  }
  public abstract run(): void;
}

export default Patchable;
