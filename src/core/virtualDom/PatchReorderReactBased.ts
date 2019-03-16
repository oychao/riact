import Patchable from './Patchable';
import VirtualNode from './VirtualNode';
import { ACTION_INSERT, ACTION_REMOVE } from 'src/constants/index';

export default class PatchReorderBefore16Diff extends Patchable {
  constructor(target: VirtualNode, patchData: Riact.TPatch) {
    super(target, patchData);
  }

  public run(): void {
    const target: VirtualNode = this.target;
    const { payload }: Riact.TPatch = this.patchData;
    /**
     * @decprecated
     */
    for (const patch of payload as Array<Riact.TPatch>) {
      const {
        type: reorderAction,
        payload: reorderPayload
      }: Riact.TPatch = patch;
      if (reorderAction === ACTION_REMOVE) {
        const {
          index
        }: Riact.TPatchRemovePayload = reorderPayload as Riact.TPatchRemovePayload;
        const [toBeRemoved] = target.children.splice(
          (reorderPayload as Riact.TPatchRemovePayload).index,
          1
        );
        const prevSibling: VirtualNode = target.children[index - 1];
        if (prevSibling) {
          prevSibling.nextSibling = toBeRemoved.nextSibling;
        }
        toBeRemoved.unmountFromDom();
      } else if (reorderAction === ACTION_INSERT) {
        const {
          index,
          item
        }: Riact.TPatchInsertPayload = reorderPayload as Riact.TPatchInsertPayload;
        (item as VirtualNode).parentNode = target;
        const prevSibling: VirtualNode = target.children[index - 1];
        const nextSibling: VirtualNode = target.children[index];
        if (prevSibling instanceof VirtualNode) {
          prevSibling.nextSibling = item as VirtualNode;
        }
        if (nextSibling instanceof VirtualNode) {
          (item as VirtualNode).nextSibling = nextSibling;
        }
        target.children.splice(index, 0, item as VirtualNode);
        (item as VirtualNode).reflectDescendantsToDom();
      }
    }

    target.clearPatchable();
  }
}
