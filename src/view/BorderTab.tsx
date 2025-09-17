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
    const selectedNode = border.getSelectedNode();
    const pinned = selectedNode?.isPinned();

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

    if (show && pinned === false) {
        style.position = "absolute";
        style.zIndex = 999;
        style.pointerEvents = "none";
        style.backgroundColor = "transparent";
        const headerRect = border.getTabHeaderRect();
        if (border.getLocation() === DockLocation.LEFT) {
            style.left = headerRect.width;
            style.top = 0;
            style.bottom = 0;
        } else if (border.getLocation() === DockLocation.RIGHT) {
            style.right = headerRect.width;
            style.top = 0;
            style.bottom = 0;
        } else if (border.getLocation() === DockLocation.TOP) {
            style.top = headerRect.height;
            style.left = 0;
            style.right = 0;
        } else { // DockLocation.BOTTOM
            style.bottom = headerRect.height;
            style.left = 0;
            style.right = 0;
        }
    }

    const className = layout.getClassName(CLASSES.FLEXLAYOUT__BORDER_TAB_CONTENTS);

    const splitter = show && pinned !== false ? <Splitter layout={layout} node={border} index={0} horizontal={horizontal} /> : null;

    if (border.getLocation() === DockLocation.LEFT || border.getLocation() === DockLocation.TOP) {
        return (
            <>
                <div ref={selfRef} style={style} className={className}>
                </div>
                {splitter}
            </>
        );
    } else {
        return (
            <>
                {splitter}
                <div ref={selfRef} style={style} className={className}>
                </div>
            </>
        );

    }
}