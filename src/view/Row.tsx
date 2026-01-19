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
    const renderPopupBar = layout.isPopup() && node.getChildren().length > 1;

    React.useLayoutEffect(() => {
        node.setRect(layout.getBoundingClientRect(selfRef.current!));
    });

    const items: React.ReactNode[] = [];

    let i = 0;

    for (const child of node.getChildren()) {
        if (i > 0) {
            items.push(<Splitter key={"splitter" + i} layout={layout} node={node} index={i} horizontal={horizontal} />)
        }
        if (child instanceof RowNode) {
            items.push(<Row key={child.getId()} layout={layout} node={child} />);
        } else if (child instanceof TabSetNode) {
            items.push(<TabSet key={child.getId()} layout={layout} node={child} />);
        }
        i++;
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

     const row = (
        <div
            ref={selfRef}
            className={layout.getClassName(CLASSES.FLEXLAYOUT__ROW)}
            style={style}
            >
            {items}
        </div>
    );

    if (renderPopupBar) {
        return (
            <div style={{display: 'flex', flexDirection: 'column', width: '100%', height: '100%'}}>
                <div className={CLASSES.FLEXLAYOUT__POPUP_TABBAR_OUTER}
                    onPointerDown={layout.onMoveStart} onPointerMove={layout.onMove} onPointerUp={layout.onMoveEnd}>
                    <div className={CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER}>Popup</div>
                </div>
                {row}
            </div>
        );
    }

    return row;
};


