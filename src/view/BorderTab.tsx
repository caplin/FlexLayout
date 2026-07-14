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

    // register with the layout's central measure pass via a callback ref: it fires whenever
    // react attaches/detaches the element, including remounts the component cannot know about
    // (e.g. moving into the maximize portal), unlike an effect
    const setSelfRef = React.useCallback(
        (element: HTMLDivElement | null) => {
            selfRef.current = element;
            controller.registerMeasurable(borderNode, "bordercontent", element);
        },
        [controller, borderNode],
    );

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

    const className = controller.getClassName(CLASSES.FLEXLAYOUT__BORDER_TAB_CONTENTS);
    const contentFirst = borderNode.getLocation() === DockLocation.LEFT || borderNode.getLocation() === DockLocation.TOP;

    if (borderNode.isOverlay()) {
        // overlay mode: the host + splitter render in an absolutely positioned wrapper overlaying
        // the main layout area (anchored to the border's edge) instead of insetting it; the
        // measured host still drives the tab panel position via the border's contentRect
        style.display = "flex";
        const wrapperStyle: React.CSSProperties = { display: show ? "flex" : "none" };
        if (horizontal) {
            // match the default border geometry: left/right panels (and their splitters) are
            // truncated by open top/bottom panels, which span the full width. Open default
            // top/bottom borders shrink the anchor element in flow, but open overlay ones do
            // not, so inset the wrapper by their size (+ splitter) explicitly
            const model = controller.getModel();
            for (const other of model.getBorderSet().getBorders()) {
                if (other !== borderNode && other.isOverlay() && other.isShowing() && other.getSelected() !== -1) {
                    const inset = other.getSize() + model.getSplitterSize();
                    if (other.getLocation() === DockLocation.TOP) {
                        wrapperStyle.top = inset;
                    } else if (other.getLocation() === DockLocation.BOTTOM) {
                        wrapperStyle.bottom = inset;
                    }
                }
            }
        }
        const wrapperClassName =
            controller.getClassName(CLASSES.FLEXLAYOUT__BORDER_TAB_OVERLAY) + " " + controller.getClassName(CLASSES.FLEXLAYOUT__BORDER_TAB_OVERLAY_ + borderNode.getLocation().getName());
        return (
            <div className={wrapperClassName} style={wrapperStyle}>
                {contentFirst && <div ref={setSelfRef} style={style} className={className}></div>}
                {show && <Splitter controller={controller} node={borderNode} index={0} horizontal={horizontal} />}
                {!contentFirst && <div ref={setSelfRef} style={style} className={className}></div>}
            </div>
        );
    }

    style.display = show ? "flex" : "none";

    if (contentFirst) {
        return (
            <>
                <div ref={setSelfRef} style={style} className={className}></div>
                {show && <Splitter controller={controller} node={borderNode} index={0} horizontal={horizontal} />}
            </>
        );
    } else {
        return (
            <>
                {show && <Splitter controller={controller} node={borderNode} index={0} horizontal={horizontal} />}
                <div ref={setSelfRef} style={style} className={className}></div>
            </>
        );
    }
}

BorderTab.displayName = "BorderTab"; // name in react dev tools
