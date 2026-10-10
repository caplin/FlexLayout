import type { RowNode } from "./RowNode";
import type { TabSetNode } from "./TabSetNode";
import { Orientation } from "./Orientation";

/** @internal */
export function validPreferredSize(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

/** @internal */
export function getPreferredSize(node: RowNode | TabSetNode, orientation: Orientation): number | undefined {
    const preferred = orientation === Orientation.HORZ ? node.getPreferredWidth() : node.getPreferredHeight();
    if (preferred !== undefined || node.getType() !== "row") {
        return preferred;
    }
    const children = node.getChildren() as (RowNode | TabSetNode)[];
    if (children.length === 0) {
        return undefined;
    }
    const sizes = children.map((child) => {
        const size = getPreferredSize(child, orientation);
        if (size === undefined) {
            return undefined;
        }
        const min = orientation === Orientation.HORZ ? child.getMinWidth() : child.getMinHeight();
        const max = orientation === Orientation.HORZ ? child.getMaxWidth() : child.getMaxHeight();
        return Math.max(min, Math.min(max, size));
    });
    if (sizes.some((size) => size === undefined)) {
        return undefined;
    }
    const retained = sizes as number[];
    return node.getOrientation() === orientation ? retained.reduce((sum, size) => sum + size, 0) + (children.length - 1) * node.getModel().getSplitterSize()! : Math.max(...retained);
}
