import type { CSSProperties } from "react";
import type { RowNode } from "../model/RowNode";
import type { TabSetNode } from "../model/TabSetNode";
import { getPreferredSize } from "../model/Sizing";

/** @internal */
export function getFlexStyle(node: RowNode | TabSetNode): CSSProperties {
    const parent = node.getParent();
    const maximized = node.getType() === "tabset" && (node as TabSetNode).isMaximized();
    const preferred = parent && parent.getChildren().length > 1 && !maximized ? getPreferredSize(node, parent.getOrientation()) : undefined;
    return {
        flexGrow: preferred === undefined ? Math.max(1, node.getWeight() * 1000) : 0,
        flexShrink: 1,
        flexBasis: preferred ?? 0,
    };
}
