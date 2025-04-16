import * as React from "react";
import { Orientation } from "../Orientation";
import { LayoutInternal } from "./Layout";
import { BorderNode } from "../model/BorderNode";
import { Splitter, splitterDragging } from "./Splitter";
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
    const timer = React.useRef<NodeJS.Timeout | undefined>(undefined);

    React.useLayoutEffect(() => {
        const contentRect = layout.getBoundingClientRect(selfRef.current!);
        if (!isNaN(contentRect.x) && contentRect.width > 0) {
            if (!border.getContentRect().equals(contentRect)) {
                border.setContentRect(contentRect);
                if (splitterDragging) { // next movement will draw tabs again, only redraw after pause/end
                    if (timer.current) {
                        clearTimeout(timer.current);
                    }
                    timer.current = setTimeout(() => {
                        layout.redrawInternal("border content rect " + contentRect);
                        timer.current = undefined;
                    }, 50);
                } else {
                    layout.redrawInternal("border content rect " + contentRect);
                }
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

    style.display = show ? "flex" : "none";

    const className = layout.getClassName(CLASSES.FLEXLAYOUT__BORDER_TAB_CONTENTS);

    if (border.getLocation() === DockLocation.LEFT || border.getLocation() === DockLocation.TOP) {
        return (
            <>
                <div ref={selfRef} style={style} className={className}>
                </div>
                {show && <Splitter layout={layout} node={border} index={0} horizontal={horizontal} />}
            </>
        );
    } else {
        return (
            <>
                {show && <Splitter layout={layout} node={border} index={0} horizontal={horizontal} />}
                <div ref={selfRef} style={style} className={className}>
                </div>
            </>
        );

    }
}