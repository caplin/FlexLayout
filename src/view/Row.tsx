import * as React from "react";
import { RowNode } from "../model/RowNode";
import { TabSetNode } from "../model/TabSetNode";
import { CLASSES } from "./CSSClassNames";
import { LayoutController } from "./layout/LayoutInternal";
import { TabSet } from "./TabSet";
import { Splitter } from "./Splitter";
import { Orientation } from "../model/Orientation";

/** @internal */
export interface IRowProps {
    controller: LayoutController;
    rowNode: RowNode;
}

/** @internal */
export const Row = (props: IRowProps) => {
    const { controller, rowNode } = props;
    const selfRef = React.useRef<HTMLDivElement>(null);

    const horizontal = rowNode.getOrientation() === Orientation.HORZ;

    // register with the layout's central measure pass via a callback ref: it fires whenever
    // react attaches/detaches the element, including remounts the component cannot know about
    // (e.g. moving into the maximize portal), unlike an effect
    const setSelfRef = React.useCallback(
        (element: HTMLDivElement | null) => {
            selfRef.current = element;
            controller.registerMeasurable(rowNode, "row", element);
        },
        [controller, rowNode],
    );

    const items: React.ReactNode[] = [];

    let i = 0;

    for (const child of rowNode.getChildren()) {
        if (i > 0) {
            items.push(<Splitter key={"splitter" + i} controller={controller} node={rowNode} index={i} horizontal={horizontal} />);
        }
        if (child instanceof RowNode) {
            items.push(<Row key={child.getId()} controller={controller} rowNode={child} />);
        } else if (child instanceof TabSetNode) {
            items.push(<TabSet key={child.getId()} controller={controller} tabsetNode={child} />);
        }
        i++;
    }

    const style: React.CSSProperties = {
        flexGrow: Math.max(1, rowNode.getWeight() * 1000), // NOTE:  flex-grow cannot have values < 1 otherwise will not fill parent, need to normalize
        minWidth: rowNode.getMinWidth(),
        minHeight: rowNode.getMinHeight(),
        maxWidth: rowNode.getMaxWidth(),
        maxHeight: rowNode.getMaxHeight(),
    };

    if (horizontal) {
        style.flexDirection = "row";
    } else {
        style.flexDirection = "column";
    }

    return (
        <div ref={setSelfRef} className={controller.getClassName(CLASSES.FLEXLAYOUT__ROW)} style={style}>
            {items}
        </div>
    );
};

Row.displayName = "Row"; // name in react dev tools
