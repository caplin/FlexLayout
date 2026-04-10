import * as React from "react";
import { Actions } from "../model/Actions";
import { BorderNode } from "../model/BorderNode";
import { RowNode } from "../model/RowNode";
import { Orientation } from "../model/Orientation";
import { CLASSES } from "./CSSClassNames";
import { LayoutController } from "./layout/LayoutInternal";
import { enablePointerOnIFrames, isDesktop, startDrag } from "./Utils";
import { Rect } from "../model/Rect";

/** @internal */
export interface ISplitterProps {
    controller: LayoutController;
    node: RowNode | BorderNode;
    index: number;
    horizontal: boolean;
}


/** @internal */
export const Splitter = (props: ISplitterProps) => {
    const { controller, node, index, horizontal } = props;

    const selfRef = React.useRef<HTMLDivElement>(null);
    const extendedRef = React.useRef<HTMLDivElement>(null);
    const pBounds = React.useRef<number[]>([]);
    const outlineDiv = React.useRef<HTMLDivElement | undefined>(undefined);
    const handleDiv = React.useRef<HTMLDivElement | undefined>(undefined);
    const dragStartX = React.useRef<number>(0);
    const dragStartY = React.useRef<number>(0);
    const initalSizes = React.useRef<{ initialSizes: number[], sum: number, startPosition: number }>({ initialSizes: [], sum: 0, startPosition: 0 })

    React.useEffect(() => {
        // Android fix: must have passive touchstart handler to prevent default handling
        selfRef.current?.addEventListener("touchstart", onTouchStart, { passive: false });
        extendedRef.current?.addEventListener("touchstart", onTouchStart, { passive: false });
        return () => {
            selfRef.current?.removeEventListener("touchstart", onTouchStart);
            extendedRef.current?.removeEventListener("touchstart", onTouchStart);
        }
    }, []);

    const onTouchStart = (event: TouchEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
        event.stopPropagation();
        if (node instanceof RowNode) {
            initalSizes.current = node.getSplitterInitials(index);
        }

        enablePointerOnIFrames(false, controller.getCurrentDocument()!);
        startDrag(event.currentTarget.ownerDocument, event, onDragMove, onDragEnd, onDragCancel);

        pBounds.current = node.getSplitterBounds(index, true);
        const rootdiv = controller.getRootDiv();
        outlineDiv.current = controller.getCurrentDocument()!.createElement("div");
        outlineDiv.current.style.flexDirection = horizontal ? "row" : "column";
        outlineDiv.current.className = controller.getClassName(CLASSES.FLEXLAYOUT__SPLITTER_DRAG) +
                    ((node instanceof BorderNode)? " " + controller.getClassName(CLASSES.FLEXLAYOUT__SPLITTER_BORDER): "");
        outlineDiv.current.style.cursor = node.getOrientation() === Orientation.VERT ? "ns-resize" : "ew-resize";

        handleDiv.current = controller.getCurrentDocument()!.createElement("div");
        handleDiv.current.className = cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE) + " " +
            (horizontal ? cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE_HORZ) : cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE_VERT));
        outlineDiv.current.appendChild(handleDiv.current);

        const r = selfRef.current!.getBoundingClientRect()!;
        const rect = new Rect(
            r.x - controller.getDomRect()!.x,
            r.y - controller.getDomRect()!.y,
            r.width,
            r.height
        );

        dragStartX.current = event.clientX - r.x;
        dragStartY.current = event.clientY - r.y;

        rect.positionElement(outlineDiv.current);
        if (rootdiv) {
            rootdiv.appendChild(outlineDiv.current);
        }
    };

    const onDragCancel = () => {
        const rootdiv = controller.getRootDiv();
        if (rootdiv && outlineDiv.current) {
            rootdiv.removeChild(outlineDiv.current as Element);
        }
        outlineDiv.current = undefined;
    };

    const onDragMove = (x: number, y: number) => {

        if (outlineDiv.current) {
            const clientRect = controller.getDomRect();
            if (!clientRect) {
                return;
            }
            if (node.getOrientation() === Orientation.VERT) {
                outlineDiv.current!.style.top = getBoundPosition(y - clientRect.y - dragStartY.current) + "px";
            } else {
                outlineDiv.current!.style.left = getBoundPosition(x - clientRect.x - dragStartX.current) + "px";
            }

            if (controller.isRealtimeResize()) {
                updateLayout(true);
            }
        }
    };

    const onDragEnd = () => {
        if (outlineDiv.current) {
            updateLayout(false);

            const rootdiv = controller.getRootDiv();
            if (rootdiv && outlineDiv.current) {
                rootdiv.removeChild(outlineDiv.current as HTMLElement);
            }
            outlineDiv.current = undefined;
        }
        enablePointerOnIFrames(true, controller.getCurrentDocument()!);
    };

    const updateLayout = (realtime: boolean) => {

        const redraw = () => {
            if (outlineDiv.current) {
                let value: number;
                if (node.getOrientation() === Orientation.VERT) {
                    value = outlineDiv.current!.offsetTop;
                } else {
                    value = outlineDiv.current!.offsetLeft;
                }

                if (node instanceof BorderNode) {
                    const pos = (node as BorderNode).calculateSplit(node, value);
                    controller.doAction(Actions.adjustBorderSplit(node.getId(), pos));
                } else {
                    const init = initalSizes.current;
                    const weights = node.calculateSplit(index, value, init.initialSizes, init.sum, init.startPosition);
                    controller.doAction(Actions.adjustWeights(node.getId(), weights));
                }
            }
        };

        redraw();
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

    const cm = controller.getClassName;
    const style: React.CSSProperties & { [key: string]: any } = {
        cursor: horizontal ? "ew-resize" : "ns-resize",
        flexDirection: horizontal ? "column" : "row"
    };

    let className = cm(CLASSES.FLEXLAYOUT__SPLITTER) + " " + cm(CLASSES.FLEXLAYOUT__SPLITTER_ + node.getOrientation().getName());

    if (node instanceof BorderNode) {
        className += " " + cm(CLASSES.FLEXLAYOUT__SPLITTER_BORDER);
    } else {
        if (node.getModel().getMaximizedTabset(controller.getLayoutId()) !== undefined) {
            style.display = "none";
        }
    }

    if (!isDesktop()) {
        style["--splitter-active-size"] = `30px`;
    }

    return (<div
        className={className}
        style={style}
        ref={selfRef}
        data-layout-path={node.getPath() + "/s" + (index - 1)}
        onPointerDown={onPointerDown}>
        <div
            className={cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE) + " " +
                (horizontal ? cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE_HORZ) : cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE_VERT))
            }>
        </div>
    </div>);

};

