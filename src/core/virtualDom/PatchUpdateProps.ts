import * as _ from '../../utils/index';

import Patchable from './Patchable';
import { PROP_STYLE, PROP_VALUE, PROP_DANGEROUS_HTML } from 'src/constants/index';
import VirtualNode from './VirtualNode';
import Component from '../component/Component';
import { loadStyle, loadDangerousInnerHTML } from './domUtils';

export default class PatchUpdateProps extends Patchable {
  constructor () {
    super();
  }

  public run (): void {
    const target: VirtualNode = this.target;
    const isDomNode: boolean = target.isTaggedDomNode();
    const isCompNode: boolean = target.isComponentNode();
    if (isDomNode || isCompNode) {
      const prevProps: Riact.TObject = Object.assign({}, target.attributes);
      const { attributes, events }: Riact.TPatchUpdatePropsPayload
        = this.patchData.payload as Riact.TPatchUpdatePropsPayload;
      for (const key in attributes as Riact.TObject) {
        if (attributes.hasOwnProperty(key)) {
          const value: any = (attributes as Riact.TObject)[key];
          target.attributes[key] = value;
          if (isDomNode) {
            if (key === PROP_STYLE) {
              loadStyle(
                target.el as HTMLElement,
                value,
                prevProps[PROP_STYLE]
              );
            } else if (key === PROP_VALUE) {
              (target.el as HTMLInputElement).value = value;
            } else if (key === PROP_DANGEROUS_HTML) {
              // children nodes will be disactive due to the dangerous inner html
              target.children = [];
              loadDangerousInnerHTML(target.el as HTMLElement, value);
            } else {
              (target.el as HTMLElement).setAttribute(key, value);
            }
          }
        }
      }
      if (isCompNode) {
        (target.el as Component).forceRenderDom();
      } else if (isDomNode) {
        for (const key in events) {
          if (events.hasOwnProperty(key)) {
            const eventHandler: Riact.TFunction = events[key];
            (target.el as HTMLElement)[key.toLowerCase()] = eventHandler;
          }
        }
      }
    }

    target.clearPatchable();
  }
}
