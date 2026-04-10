import * as React from "react";
import { Orientation } from "../model/Orientation";
import { LayoutController } from "./layout/LayoutInternal";
import { BorderNode } from "../model/BorderNode";
import { Splitter } from "./Splitter";
import { DockLocation } from "../model/DockLocation";
import { CLASSES } from "./CSSClassNames";

/** @internal */
export interface IBorderTabProps {
    controller: LayoutController;
    borderNode: BorderNode;
    show: boolean;
}

export function BorderTab(props: IBorderTabProps) {
    const { controller, borderNode, show } = props;
    const selfRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
        const contentRect = controller.getBoundingClientRect(selfRef.current!);
        if (!isNaN(contentRect.x) && contentRect.width > 0) {
            if (!borderNode.getContentRect().equalsWhenRounded(contentRect)) {
                borderNode.setContentRect(contentRect);
                controller.setReLayout(true);
            }
        }
    });

    let horizontal = true;
    const style: React.CSSProperties = {};

    if (borderNode.getOrientation() === Orientation.HORZ) {
        style.width = borderNode.getSize();
        style.minWidth = borderNode.getMinSize();
        style.maxWidth = borderNode.getMaxSize();
    } else {
        style.height = borderNode.getSize();
        style.minHeight = borderNode.getMinSize();
        style.maxHeight = borderNode.getMaxSize();
        horizontal = false;
    }

    style.display = show ? "flex" : "none";

    const className = controller.getClassName(CLASSES.FLEXLAYOUT__BORDER_TAB_CONTENTS);

    if (borderNode.getLocation() === DockLocation.LEFT || borderNode.getLocation() === DockLocation.TOP) {
        return (
            <>
                <div ref={selfRef} style={style} className={className}>
                </div>
                {show && <Splitter controller={controller} node={borderNode} index={0} horizontal={horizontal} />}
            </>
        );
    } else {
        return (
            <>
                {show && <Splitter controller={controller} node={borderNode} index={0} horizontal={horizontal} />}
                <div ref={selfRef} style={style} className={className}>
                </div>
            </>
        );

    }
}
