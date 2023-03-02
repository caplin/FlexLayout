import { TabSetNode } from "./TabSetNode";
import { BorderNode } from "./BorderNode";
import { RowNode } from "./RowNode";
import { TabNode } from "./TabNode";

/** @internal */
export function adjustSelectedIndexAfterFloat(node: TabNode) {
    const parent = node.getParent();
    if (parent !== null) {
        if (parent instanceof TabSetNode) {
            let found = false;
            let newSelected = 0;
            const children = parent.getChildren();
            for (let i = 0; i < children.length; i++) {
                const child = children[i] as TabNode;
                if (child === node) {
                    found = true;
                } else {
                    if (!child.isFloating()) {
                        newSelected = i;
                        if (found) break;
                    }
                }
            }
            parent._setSelected(newSelected);
        } else if (parent instanceof BorderNode) {
            parent._setSelected(-1);
        }
    }
}

/** @internal */
export function adjustSelectedIndexAfterDock(node: TabNode) {
    const parent = node.getParent();
    if (parent !== null && (parent instanceof TabSetNode || parent instanceof BorderNode)) {
        const children = parent.getChildren();
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as TabNode;
            if (child === node) {
                parent._setSelected(i);
                return;
            }
        }
    }
}

/** @internal */
export function adjustSelectedIndex(parent: TabSetNode | BorderNode | RowNode, removedIndex: number) {
    // for the tabset/border being removed from set the selected index
    if (parent !== undefined && (parent.getType() === TabSetNode.TYPE || parent.getType() === BorderNode.TYPE)) {
        const selectedIndex = (parent as TabSetNode | BorderNode).getSelected();
        if (selectedIndex !== -1) {
            if (removedIndex === selectedIndex && parent.getChildren().length > 0) {
                if (removedIndex >= parent.getChildren().length) {
                    // removed last tab; select new last tab
                    parent._setSelected(parent.getChildren().length - 1);
                } else {
                    // leave selected index as is, selecting next tab after this one
                }
            } else if (removedIndex < selectedIndex) {
                parent._setSelected(selectedIndex - 1);
            } else if (removedIndex > selectedIndex) {
                // leave selected index as is
            } else {
                parent._setSelected(-1);
            }
        }
    }
}

export function randomUUID() {
    // @ts-ignore
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }


