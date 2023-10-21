import * as React from "react";
import { DragDrop } from "../DragDrop";
import { Actions } from "../model/Actions";
import { BorderNode } from "../model/BorderNode";
import { Node } from "../model/Node";
import { RowNode } from "../model/RowNode";
import { SplitterNode } from "../model/SplitterNode";
import { Orientation } from "../Orientation";
import { CLASSES } from "../Types";
import { ILayoutCallbacks } from "./Layout";

/** @internal */
export interface ISplitterProps {
    layout: ILayoutCallbacks;
    node: SplitterNode;
    path: string;
}

/** @internal */
export const Splitter = (props: ISplitterProps) => {
    const { layout, node, path } = props;

    const pBounds = React.useRef<number[]>([]);
    const outlineDiv = React.useRef<HTMLDivElement | undefined>(undefined);
    const parentNode = node.getParent() as RowNode | BorderNode;

    const onMouseDown = (
        event:
            | Event
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        DragDrop.instance.setGlassCursorOverride(
            node.getOrientation() === Orientation.HORZ
                ? "ns-resize"
                : "ew-resize"
        );
        DragDrop.instance.startDrag(
            event,
            onDragStart,
            onDragMove,
            onDragEnd,
            onDragCancel,
            undefined,
            undefined,
            layout.getCurrentDocument(),
            layout.getRootDiv() ?? undefined
        );
        pBounds.current = parentNode._getSplitterBounds(node, true);
        const rootdiv = layout.getRootDiv();
        outlineDiv.current = layout.getCurrentDocument()!.createElement("div");
        outlineDiv.current.style.position = "absolute";
        outlineDiv.current.className = layout.getClassName(CLASSES.FLEXLAYOUT__SPLITTER_DRAG);
        outlineDiv.current.style.cursor = node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize";
        const r = node.getRect();
        if (node.getOrientation() === Orientation.VERT && r.width < 2) {
            r.width = 2;
        } else if (node.getOrientation() === Orientation.HORZ && r.height < 2) {
            r.height = 2;
        }

        r.positionElement(outlineDiv.current);
        if (rootdiv) {
            rootdiv.appendChild(outlineDiv.current);
        }
    };

    const onDragCancel = (_wasDragging: boolean) => {
        const rootdiv = layout.getRootDiv();
        if (rootdiv) {
            rootdiv.removeChild(outlineDiv.current as Element);
        }
    };

    const onDragStart = () => {
        return true;
    };

    const onDragMove = (event: React.MouseEvent<Element, MouseEvent>) => {
        const clientRect = layout.getDomRect();
        if (!clientRect) {
            return;
        }

        const pos = {
            x: event.clientX - clientRect.left,
            y: event.clientY - clientRect.top,
        };

        if (outlineDiv) {
            if (node.getOrientation() === Orientation.HORZ) {
                outlineDiv.current!.style.top = getBoundPosition(pos.y - 4) + "px";
            } else {
                outlineDiv.current!.style.left = getBoundPosition(pos.x - 4) + "px";
            }
        }

        if (layout.isRealtimeResize()) {
            updateLayout();
        }
    };

    const updateLayout = () => {
        let value = 0;
        if (outlineDiv) {
            if (node.getOrientation() === Orientation.HORZ) {
                value = outlineDiv.current!.offsetTop;
            } else {
                value = outlineDiv.current!.offsetLeft;
            }
        }

        if (parentNode instanceof BorderNode) {
            const pos = (parentNode as BorderNode)._calculateSplit(node, value);
            layout.doAction(Actions.adjustBorderSplit((node.getParent() as Node).getId(), pos));
        } else {
            const splitSpec = parentNode._calculateSplit(node, value);
            if (splitSpec !== undefined) {
                layout.doAction(Actions.adjustSplit(splitSpec));
            }
        }
    };

    const onDragEnd = () => {
        updateLayout();

        const rootdiv = layout.getRootDiv();
        if (rootdiv) {
            rootdiv.removeChild(outlineDiv.current as HTMLDivElement);
        }
    };

    const getBoundPosition = (p: number) => {
        const bounds = pBounds.current as number[];
        let rtn = p;
        if (p < bounds[0]) {
            rtn = bounds[0];
        }
        if (p > bounds[1]) {
            rtn = bounds[1];
        }

        return rtn;
    };

    const cm = layout.getClassName;
    let r = node.getRect();
    const style = r.styleWithPosition({
        cursor: node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize",
    });
    let className = cm(CLASSES.FLEXLAYOUT__SPLITTER) + " " + cm(CLASSES.FLEXLAYOUT__SPLITTER_ + node.getOrientation().getName());

    if (parentNode instanceof BorderNode) {
        className += " " + cm(CLASSES.FLEXLAYOUT__SPLITTER_BORDER);
    } else {
        if (node.getModel().getMaximizedTabset() !== undefined) {
            style.display = "none";
        }
    }

    const extra = node.getModel().getSplitterExtra();
    if (extra === 0) {
        return (<div
            style={style}
            data-layout-path={path}
            className={className}
            onTouchStart={onMouseDown}
            onMouseDown={onMouseDown}>
        </div>);
    } else {
        // add extended transparent div for hit testing
        // extends forward only, so as not to interfere with scrollbars
        let r2 = r.clone();
        r2.x = 0;
        r2.y = 0;
        if (node.getOrientation() === Orientation.VERT) {
            r2.width += extra;
        } else {
            r2.height += extra;
        }
        const style2 = r2.styleWithPosition({
            cursor: node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize"
        });

        const className2 = cm(CLASSES.FLEXLAYOUT__SPLITTER_EXTRA);

        return (
            <div
                style={style}
                data-layout-path={path}
                className={className}>
                <div
                    style={style2}
                    className={className2}
                    onTouchStart={onMouseDown}
                    onMouseDown={onMouseDown}>
                </div>
            </div>);
    }

};
