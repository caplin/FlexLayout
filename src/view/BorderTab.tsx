import * as React from "react";
import { Orientation } from "../Orientation";
import { LayoutInternal } from "./Layout";
import { BorderNode } from "../model/BorderNode";
import { Rect } from "../Rect";
import { Splitter } from "./Splitter";
import { DockLocation } from "../DockLocation";
import { CLASSES } from "../Types";

/** @internal */
export interface IBorderTabProps {
    layout: LayoutInternal;
    border: BorderNode;
    show: boolean;
}

export function BorderTab(props: IBorderTabProps) {
    const { layout, border, show } = props;
    const selfRef = React.useRef<HTMLDivElement | null>(null);

    React.useLayoutEffect(() => {
        const outerRect = layout.getBoundingClientRect(selfRef.current!);
        const contentRect = Rect.getContentRect(selfRef.current!).relativeTo(layout.getDomRect()!);
        if (outerRect.width > 0) {
            border.setOuterRect(outerRect);
            if (!border.getContentRect().equals(contentRect)) {
                border.setContentRect(contentRect);
                layout.redrawInternal("border content rect");
            }
        }

    });

    let horizontal = true;
    const style: Record<string, any> = {};

    if (border.getOrientation() === Orientation.HORZ) {
        style.width = border.getSize();
        style.minWidth = border.getMinSize();
        style.maxWidth = border.getMaxSize();
    } else {
        style.height = border.getSize();
        style.minHeight = border.getMinSize();
        style.maxHeight = border.getMaxSize();
        horizontal = false;
    }

    style.display = show ? "flex":"none";

    const className = layout.getClassName(CLASSES.FLEXLAYOUT__BORDER_TAB_CONTENTS);

    if (border.getLocation() === DockLocation.LEFT || border.getLocation() === DockLocation.TOP) {
        return (
            <>
                <div ref={selfRef} style={style} className={className}>
                </div>
                {show && <Splitter layout={layout} node={border} index={0}  horizontal={horizontal} />}
            </>
        );
    } else {
        return (
            <>
                {show && <Splitter layout={layout} node={border} index={0}  horizontal={horizontal} />}
                <div ref={selfRef} style={style}  className={className}>
                </div>
            </>
        );

    }
}