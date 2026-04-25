import * as React from "react";
// import { createPortal } from 'react-dom';
import { CLASSES } from "./CSSClassNames";
import { LayoutController } from "./layout/LayoutInternal";
import { Layout } from "../model/Layout";
import { Rect } from "../model/Rect";
import { startDrag, getPageMetrics } from "./Utils";

enum FloatWindowResizeDirection {
    North = "n",
    South = "s",
    East = "e",
    West = "w",
    NorthWest = "nw",
    NorthEast = "ne",
    SouthWest = "sw",
    SouthEast = "se",
}

/** @internal */
export interface IFloatWindowProps {
    controller: LayoutController;
    layout: Layout;
    zIndex: number;
    onCloseLayout: (layout: Layout) => void;
}

const RESIZE_ZINDEX = 10;
const RESIZE_MARGIN = -4;
const RESIZE_EDGE_SIZE = 8;
const RESIZE_CORNER_SIZE = 12;
const RESIZE_SE_CORNER_SIZE = 12;
const MIN_WIDTH = 150;
const MIN_HEIGHT = 25;

/** @internal */
export const FloatWindow = (props: React.PropsWithChildren<IFloatWindowProps>) => {
    const { controller, layout, children } = props;
    const [rect, setRect] = React.useState<Rect>(layout.getRect());
    // const icons = controller.getIcons();
    const cm = controller.getClassName;
    const selfRef = React.useRef<HTMLDivElement>(null);
    const headerRef = React.useRef<HTMLDivElement>(null);
    const nRef = React.useRef<HTMLDivElement>(null);
    const neRef = React.useRef<HTMLDivElement>(null);
    const eRef = React.useRef<HTMLDivElement>(null);
    const seRef = React.useRef<HTMLDivElement>(null);
    const sRef = React.useRef<HTMLDivElement>(null);
    const swRef = React.useRef<HTMLDivElement>(null);
    const wRef = React.useRef<HTMLDivElement>(null);
    const nwRef = React.useRef<HTMLDivElement>(null);
    const moveToFrontRef = React.useRef<boolean>(false);

    const clampToDoc = React.useCallback((rect: Rect) => {
        const layoutRect = Rect.fromDomRect(controller.getRootDiv()!.getBoundingClientRect());
        let boundaryRect: Rect;
        if (controller.getProps().constrainFloatPanels) {
            boundaryRect = new Rect(0, 0, layoutRect.width, layoutRect.height);
        } else {
            const page = getPageMetrics();
            // Use Math.max to ensure the boundary covers at least the visible window
            const width = Math.max(page.fullWidth, window.innerWidth);
            const height = Math.max(page.fullHeight, window.innerHeight);
            boundaryRect = new Rect(-layoutRect.x, -layoutRect.y, width, height);
        }

        const clamped = rect.clone();
        clamped.clamp(boundaryRect);
        return clamped;
    }, [controller]);


    const onTouchStart = React.useCallback((event: TouchEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
    }, []);

    React.useEffect(() => {
        const refs = [headerRef, nRef, neRef, eRef, seRef, sRef, swRef, wRef, nwRef];
        const elements = refs.map(r => r.current).filter(el => el !== null);

        elements.forEach(el => el!.addEventListener("touchstart", onTouchStart, { passive: false }));

        return () => {
            elements.forEach(el => el!.removeEventListener("touchstart", onTouchStart));
        };
    }, [onTouchStart]);

    const initializedRef = React.useRef(false);

    React.useLayoutEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            const clamped = clampToDoc(rect);
            if (!clamped.equals(rect)) {

                // eslint-disable-next-line react-hooks/set-state-in-effect
                setRect(clamped);
                layout.setRect(clamped);
            }
        }
    }, [clampToDoc, rect, layout]);

    React.useEffect(() => {
        const onPointerDown = () => {
            const layouts = [...controller.getModel().getLayouts()];
            const frontLayout = layouts[layouts.length - 1][1];
            if (layout !== frontLayout) {
                moveToFrontRef.current = true;
            }
        };
        const onPointerUp = () => {
            if (moveToFrontRef.current) {
                setTimeout(() => {
                    controller.moveWindowToFront(layout.getLayoutId());
                }, 10);
                moveToFrontRef.current = false
            }
        };
        const current = selfRef.current;
        if (current) {
            current.addEventListener("pointerdown", onPointerDown, { capture: true });
            current.addEventListener("pointerup", onPointerUp);
        }
        return () => {
            if (current) {
                current.removeEventListener("pointerdown", onPointerDown, { capture: true });
                current.removeEventListener("pointerup", onPointerUp);
            }
        };
    }, [controller, layout]);

    const onPointerDownHeader = (e: React.PointerEvent<HTMLElement>) => {
        e.stopPropagation();
        const offset = { x: e.clientX - rect.x, y: e.clientY - rect.y };

        startDrag(document, e,
            (x, y) => {
                controller.showOverlayOnAllWindows(true);
                if (moveToFrontRef.current) {
                    controller.moveWindowToFront(layout.getLayoutId());
                    moveToFrontRef.current = false
                }
                const newRect = new Rect(x - offset.x, y - offset.y, rect.width, rect.height);
                const clamped = clampToDoc(newRect);
                setRect(clamped);
                layout.setRect(clamped);
            },

            () => {
                controller.redrawLayout();
                controller.showOverlayOnAllWindows(false);
            },
            () => { }
        );
    };

    const onPointerDownResize = (e: React.PointerEvent<HTMLElement>, direction: FloatWindowResizeDirection) => {
        const startRect = rect;
        const startPos = { x: e.clientX, y: e.clientY };

        startDrag(document, e,
            (x, y) => {
                controller.showOverlayOnAllWindows(true)
                const dx = x - startPos.x;
                const dy = y - startPos.y;
                let newX = startRect.x;
                let newY = startRect.y;
                let newW = startRect.width;
                let newH = startRect.height;

                if (direction.includes("n")) {
                    newY += dy;
                    newH -= dy;
                }
                if (direction.includes("s")) {
                    newH += dy;
                }
                if (direction.includes("w")) {
                    newX += dx;
                    newW -= dx;
                }
                if (direction.includes("e")) {
                    newW += dx;
                }

                const newRect = new Rect(newX, newY, Math.max(MIN_WIDTH, newW), Math.max(MIN_HEIGHT, newH));
                const clamped = clampToDoc(newRect);
                setRect(clamped);
                layout.setRect(clamped);
            },

            () => {
                controller.redrawLayout();
                controller.showOverlayOnAllWindows(false)
            },
            () => { }
        );
        e.stopPropagation();
    };

    const content = (<div
        ref={selfRef}
        className={cm(CLASSES.FLEXLAYOUT__FLOAT_WINDOW)}
        style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            position: "absolute",
            // zIndex: zIndex // needed if using portal
        }}
    >
        <div ref={headerRef} className={cm(CLASSES.FLEXLAYOUT__FLOAT_WINDOW_HEADER)} onPointerDown={onPointerDownHeader}>
            {/* <div className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_ICON)}>
                    {(typeof icons.popoutFloat === "function") ? icons.popoutFloat(layout) : icons.popoutFloat}
                </div> */}
            <div style={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 50, height: 8, display: "flex", flexDirection: "column", justifyContent: "space-around", opacity: 0.5 }}>
                    <div style={{ height: 2, backgroundColor: "gray", borderRadius: 1 }}></div>
                </div>
            </div>
            {/* <div
                    className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_CLOSE)}
                    style={{ cursor: "pointer" }}
                    onClick={() => onCloseLayout(layout)}
                >
                    {(typeof icons.closeFloatPopout === "function") ? icons.closeFloatPopout() : icons.closeFloatPopout}
                </div> */}
        </div>
        <div className={cm(CLASSES.FLEXLAYOUT__FLOAT_WINDOW_CONTENT)}>
            {children}
        </div>
        <div ref={nRef} style={{ position: "absolute", zIndex: RESIZE_ZINDEX, top: RESIZE_MARGIN, left: RESIZE_EDGE_SIZE, right: RESIZE_EDGE_SIZE, height: RESIZE_EDGE_SIZE, cursor: "ns-resize" }} onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.North)} />
        <div ref={sRef} style={{ position: "absolute", zIndex: RESIZE_ZINDEX, bottom: RESIZE_MARGIN, left: RESIZE_EDGE_SIZE, right: RESIZE_EDGE_SIZE, height: RESIZE_EDGE_SIZE, cursor: "ns-resize" }} onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.South)} />
        <div ref={eRef} style={{ position: "absolute", zIndex: RESIZE_ZINDEX, top: RESIZE_EDGE_SIZE, bottom: RESIZE_EDGE_SIZE, right: RESIZE_MARGIN, width: RESIZE_EDGE_SIZE, cursor: "ew-resize" }} onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.East)} />
        <div ref={wRef} style={{ position: "absolute", zIndex: RESIZE_ZINDEX, top: RESIZE_EDGE_SIZE, bottom: RESIZE_EDGE_SIZE, left: RESIZE_MARGIN, width: RESIZE_EDGE_SIZE, cursor: "ew-resize" }} onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.West)} />
        <div ref={nwRef} style={{ position: "absolute", zIndex: RESIZE_ZINDEX, top: RESIZE_MARGIN, left: RESIZE_MARGIN, width: RESIZE_CORNER_SIZE, height: RESIZE_CORNER_SIZE, cursor: "nwse-resize" }} onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.NorthWest)} />
        <div ref={neRef} style={{ position: "absolute", zIndex: RESIZE_ZINDEX, top: RESIZE_MARGIN, right: RESIZE_MARGIN, width: RESIZE_CORNER_SIZE, height: RESIZE_CORNER_SIZE, cursor: "nesw-resize" }} onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.NorthEast)} />
        <div ref={swRef} style={{ position: "absolute", zIndex: RESIZE_ZINDEX, bottom: RESIZE_MARGIN, left: RESIZE_MARGIN, width: RESIZE_CORNER_SIZE, height: RESIZE_CORNER_SIZE, cursor: "nesw-resize" }} onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.SouthWest)} />
        <div ref={seRef} style={{ position: "absolute", zIndex: RESIZE_ZINDEX, bottom: 0, right: 0, width: RESIZE_SE_CORNER_SIZE, height: RESIZE_SE_CORNER_SIZE, cursor: "nwse-resize" }} onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.SouthEast)} />
    </div>);

    // const portal = createPortal(content, document.documentElement, layout.getLayoutId());
    // return portal;

    return content;
};
