export default class DomUpdate {
  public patchQueue: Array<common.TPatch>;
  public updateDom(): void {}
  public pushPatch(): common.TPatch {
    return this.patchQueue.pop();
  }
};
