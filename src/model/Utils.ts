import TabSetNode from "./TabSetNode";
import BorderNode from "./BorderNode";
import RowNode from "./RowNode";

/** @hidden @internal */
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
