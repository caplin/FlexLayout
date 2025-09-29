import * as React from "react";
import { RowNode } from "../model/RowNode";
import { TabSetNode } from "../model/TabSetNode";
import { CLASSES } from "../Types";
import { LayoutInternal } from "./Layout";
import { TabSet } from "./TabSet";
import { Splitter } from "./Splitter";
import { Orientation } from "../Orientation";

/** @internal */
export interface IRowProps {
    layout: LayoutInternal;
    node: RowNode;
}

/** @internal */
export const Row = (props: IRowProps) => {
    const { layout, node } = props;
    const selfRef = React.useRef<HTMLDivElement | null>(null);

    const horizontal = node.getOrientation() === Orientation.HORZ;

    React.useLayoutEffect(() => {
        node.setRect(layout.getBoundingClientRect(selfRef.current!));
    });

    const items: React.ReactNode[] = [];

    const isHiddenNode = (node: any): boolean =>
        (
            node instanceof TabSetNode &&
            node.getChildren().length === 0 &&
            node.isEnableHideWhenEmpty()
        ) ||
        (
            node instanceof RowNode &&
            node.getChildren().every((cr) => isHiddenNode(cr))
        );

    const children = node.getChildren();

    for (let i = 0; i < children.length; i++) {

        const c = children[i];
        const lc = i > 0 ? children[i - 1] : undefined;
        const hidden = isHiddenNode(c);
        const lcHidden = lc ? isHiddenNode(lc) : undefined;

        if (lc && !lcHidden && !hidden) {
            items.push(<Splitter key={"splitter" + i} layout={layout} node={node} index={i} horizontal={horizontal} />)
        }
        if (c instanceof RowNode) {
            if (hidden) {
                items.push(<div style={{ "display": "none" }}>
                    <Row key={c.getId()} layout={layout} node={c} />
                </div>);
            } else {
                items.push(<Row key={c.getId()} layout={layout} node={c} />);
            }
        } else if (c instanceof TabSetNode) {
            if (!hidden) {
                items.push(<TabSet key={c.getId()} layout={layout} node={c} />);
            } else {
                items.push(<div style={{ "display": "none" }}>
                    <TabSet key={c.getId()} layout={layout} node={c} />
                </div>);
            }
        }
    }

    const style: Record<string, any> = {
        flexGrow: Math.max(1, node.getWeight()*1000), // NOTE:  flex-grow cannot have values < 1 otherwise will not fill parent, need to normalize 
        minWidth: node.getMinWidth(),
        minHeight: node.getMinHeight(),
        maxWidth: node.getMaxWidth(),
        maxHeight: node.getMaxHeight(),
    };

    if (horizontal) {
        style.flexDirection = "row";
    } else {
        style.flexDirection = "column";
    }

     return (
        <div
            ref={selfRef}
            className={layout.getClassName(CLASSES.FLEXLAYOUT__ROW)}
            style={style}
            >
            {items}
        </div>
    );
};