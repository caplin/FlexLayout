import { TabSetNode } from "./TabSetNode";
import { BorderNode } from "./BorderNode";
import { RowNode } from "./RowNode";
import { TabNode } from "./TabNode";

/** @internal */
export function adjustSelectedIndexAfterDock(node: TabNode) {
    const parent = node.getParent();
    if (parent !== null && (parent instanceof TabSetNode || parent instanceof BorderNode)) {
        const children = parent.getChildren();
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as TabNode;
            if (child === node) {
                parent.setSelected(i);
                return;
            }
        }
    }
}

/** @internal */
export function adjustSelectedIndex(parent: TabSetNode | BorderNode | RowNode, removedIndex: number) {
    // for the tabset/border being removed from set the selected index
    if (parent !== undefined && (parent instanceof TabSetNode || parent instanceof BorderNode)) {
        const selectedIndex = (parent as TabSetNode | BorderNode).getSelected();
        if (selectedIndex !== -1) {
            if (removedIndex === selectedIndex && parent.getChildren().length > 0) {
                if (removedIndex >= parent.getChildren().length) {
                    // removed last tab; select new last tab
                    parent.setSelected(parent.getChildren().length - 1);
                } else {
                    // leave selected index as is, selecting next tab after this one
                }
            } else if (removedIndex < selectedIndex) {
                parent.setSelected(selectedIndex - 1);
            } else if (removedIndex > selectedIndex) {
                // leave selected index as is
            } else {
                parent.setSelected(-1);
            }
        }
    }
}

export function randomUUID(): string {
    // @ts-ignore
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }


