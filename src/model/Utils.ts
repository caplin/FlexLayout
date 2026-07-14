import { TabSetNode } from "./TabSetNode";
import { BorderNode } from "./BorderNode";
import { RowNode } from "./RowNode";

/** @internal */
export function adjustSelectedIndexAfterInsert(parent: TabSetNode | BorderNode, insertedIndex: number, count: number = 1) {
    // shift the selected index when tabs are inserted at or before it, so the same tab stays selected
    const selectedIndex = parent.getSelected();
    if (count > 0 && selectedIndex !== -1 && insertedIndex <= selectedIndex) {
        parent.setSelected(selectedIndex + count);
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
    // @ts-expect-error - Fallback for crypto or unknown global environments
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
}
