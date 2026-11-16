import * as React from "react";
import { CLASSES } from "../CSSClassNames";
import { LayoutController } from "./layout/LayoutInternal";
import { ModelLayout } from "../model/ModelLayout";
import { Rect } from "../model/Rect";
import { DRAG_THRESHOLD, startDrag, getPageMetrics } from "./Utils";
import { Actions } from "../model/Actions";
import { I18nLabel } from "./I18nLabel";

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
    layout: ModelLayout;
    zIndex: number;
    onCloseLayout: (layout: ModelLayout) => void;
}

const RESIZE_ZINDEX = 10;
const RESIZE_MARGIN = -4;
const RESIZE_EDGE_SIZE = 8;
const RESIZE_CORNER_SIZE = 12;
const MIN_WIDTH = 150;
const MIN_HEIGHT = 25;

/** @internal */
export const FloatWindow = (props: React.PropsWithChildren<IFloatWindowProps>) => {
    const { controller, layout, children } = props;
    const [rect, setRect] = React.useState<Rect>(layout.getRect());
    const latestRect = React.useRef<Rect>(Rect.empty());
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
    const raiseTimerRef = React.useRef<number | undefined>(undefined);

    React.useEffect(() => {
        latestRect.current = rect;
    }, [rect]);

    React.useEffect(() => {
        const id = requestAnimationFrame(() => {
            setRect(layout.getRect());
        });
        return () => cancelAnimationFrame(id);
    }, [layout]);

    const clampToDoc = React.useCallback(
        (rect: Rect) => {
            const win = controller.getCurrentWindow() ?? window;
            const layoutRect = Rect.fromDomRect(controller.getRootDiv()!.getBoundingClientRect());
            let boundaryRect: Rect;
            if (controller.getProps().constrainFloatPanels) {
                boundaryRect = new Rect(0, 0, layoutRect.width, layoutRect.height);
            } else {
                const page = getPageMetrics(win);
                const width = Math.max(page.fullWidth, win.innerWidth);
                const height = Math.max(page.fullHeight, win.innerHeight);
                boundaryRect = new Rect(-layoutRect.x, -layoutRect.y, width, height);
            }

            const clamped = rect.clone();
            clamped.clamp(boundaryRect);
            return clamped;
        },
        [controller],
    );

    const onTouchStart = React.useCallback((event: TouchEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
    }, []);

    React.useEffect(() => {
        const refs = [headerRef, nRef, neRef, eRef, seRef, sRef, swRef, wRef, nwRef];
        const elements = refs.map((r) => r.current).filter((el) => el !== null);

        elements.forEach((el) => el!.addEventListener("touchstart", onTouchStart, { passive: false }));

        return () => {
            elements.forEach((el) => el!.removeEventListener("touchstart", onTouchStart));
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
        const win = controller.getCurrentWindow() ?? window;
        const onPointerUp = () => {
            if (moveToFrontRef.current) {
                raiseTimerRef.current = win.setTimeout(() => {
                    raiseTimerRef.current = undefined;
                    controller.moveWindowToFront(layout.getLayoutId());
                }, 10);
                moveToFrontRef.current = false;
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
            // cancel a pending front-raise so it can't dispatch after unmount
            if (raiseTimerRef.current !== undefined) {
                win.clearTimeout(raiseTimerRef.current);
                raiseTimerRef.current = undefined;
            }
        };
    }, [controller, layout]);

    // ends a move or resize drag; a click (no drag) leaves the model untouched
    const onDragEnd = (moved: boolean) => {
        if (moved) {
            controller.doAction(Actions.moveFloat(layout.getLayoutId(), latestRect.current).setAdjusting(false));
        }
        controller.redrawLayout();
        controller.showOverlayOnAllWindows(false);
    };

    const onPointerDownHeader = (e: React.PointerEvent<HTMLElement>) => {
        e.stopPropagation();
        const offset = { x: e.clientX - rect.x, y: e.clientY - rect.y };
        controller.showOverlayOnAllWindows(true);

        startDrag(
            controller.getCurrentDocument() ?? document,
            e,
            (x, y) => {
                if (moveToFrontRef.current) {
                    controller.moveWindowToFront(layout.getLayoutId());
                    moveToFrontRef.current = false;
                }
                const newRect = new Rect(x - offset.x, y - offset.y, rect.width, rect.height);
                const clamped = clampToDoc(newRect);
                setRect(clamped);
                controller.doAction(Actions.moveFloat(layout.getLayoutId(), clamped).setAdjusting(true));
            },

            onDragEnd,
            onDragEnd,
            DRAG_THRESHOLD,
        );
    };

    const icons = controller.getIcons();

    // a panel can only pop out when every tab in it can live in a separate window
    const canPopout = controller.isSupportsPopout() && layout.getRootRow()?.isAllowedInWindow() === true;

    // the checkerboard handle docks the whole floating layout into the main layout
    const onDragStartDock = (event: React.DragEvent<HTMLElement>) => {
        event.stopPropagation();
        if (layout.getRootRow()?.getChildren().length) {
            controller.getDragDropManager().startDockLayoutDrag(event.nativeEvent, layout, selfRef.current ?? undefined);
        } else {
            event.preventDefault();
        }
    };

    const onDragEndDock = (_event: React.DragEvent<HTMLElement>) => {
        controller.getDragDropManager().onDragEnded();
    };

    const onDockHandlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
        // prevent the header's pointer move-drag from starting
        event.stopPropagation();
    };

    const onPopoutFloatClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        // the float's rect is relative to the main layout root; convert it to screen coords
        const screenRect = controller.getScreenRect(layout.getRect());
        controller.doAction(Actions.popoutFloat(layout.getLayoutId(), screenRect.toJson()));
    };

    const onPointerDownResize = (e: React.PointerEvent<HTMLElement>, direction: FloatWindowResizeDirection) => {
        const startRect = rect;
        const startPos = { x: e.clientX, y: e.clientY };
        controller.showOverlayOnAllWindows(true);

        startDrag(
            controller.getCurrentDocument() ?? document,
            e,
            (x, y) => {
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
                controller.doAction(Actions.moveFloat(layout.getLayoutId(), clamped).setAdjusting(true));
            },

            onDragEnd,
            onDragEnd,
            DRAG_THRESHOLD,
        );
        e.stopPropagation();
    };

    const content = (
        <div
            ref={selfRef}
            className={cm(CLASSES.FLEXLAYOUT__FLOAT_WINDOW)}
            style={{
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                position: "absolute",
            }}
        >
            <div ref={headerRef} className={cm(CLASSES.FLEXLAYOUT__FLOAT_WINDOW_HEADER)} onPointerDown={onPointerDownHeader}>
                <div
                    data-layout-path="/floatwindow/drag-handle"
                    className={cm(CLASSES.FLEXLAYOUT__FLOAT_WINDOW_DRAG_HANDLE)}
                    draggable={true}
                    title={controller.i18nName(I18nLabel.Dock_Float_To_Layout)}
                    aria-label={controller.i18nName(I18nLabel.Dock_Float_To_Layout)}
                    onDragStart={onDragStartDock}
                    onDragEnd={onDragEndDock}
                    onPointerDown={onDockHandlePointerDown}
                >
                    {icons.dragToDock}
                </div>
                <div style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", minWidth: 0, overflow: "hidden" }}>
                    {layout.getName() !== undefined ? (
                        <span data-layout-path="/floatwindow/title" className={cm(CLASSES.FLEXLAYOUT__FLOAT_WINDOW_HEADER_TITLE)} title={layout.getName()}>
                            {layout.getName()}
                        </span>
                    ) : (
                        <div style={{ width: 50, height: 8, display: "flex", flexDirection: "column", justifyContent: "space-around", opacity: 0.5 }}>
                            <div style={{ height: 2, backgroundColor: "gray", borderRadius: 1 }}></div>
                        </div>
                    )}
                </div>
                {canPopout && (
                    <button
                        type="button"
                        data-layout-path="/floatwindow/button/popout"
                        className={cm(CLASSES.FLEXLAYOUT__FLOAT_WINDOW_BUTTON)}
                        title={controller.i18nName(I18nLabel.Popout_Float_To_Window)}
                        aria-label={controller.i18nName(I18nLabel.Popout_Float_To_Window)}
                        onClick={onPopoutFloatClick}
                        onPointerDown={onDockHandlePointerDown}
                    >
                        {icons.popoutFloatWindow}
                    </button>
                )}
            </div>
            <div className={cm(CLASSES.FLEXLAYOUT__FLOAT_WINDOW_CONTENT)}>{children}</div>
            <div
                ref={nRef}
                style={{ position: "absolute", zIndex: RESIZE_ZINDEX, top: RESIZE_MARGIN, left: RESIZE_EDGE_SIZE, right: RESIZE_EDGE_SIZE, height: RESIZE_EDGE_SIZE, cursor: "ns-resize" }}
                onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.North)}
            />
            <div
                ref={sRef}
                style={{ position: "absolute", zIndex: RESIZE_ZINDEX, bottom: RESIZE_MARGIN, left: RESIZE_EDGE_SIZE, right: RESIZE_EDGE_SIZE, height: RESIZE_EDGE_SIZE, cursor: "ns-resize" }}
                onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.South)}
            />
            <div
                ref={eRef}
                style={{ position: "absolute", zIndex: RESIZE_ZINDEX, top: RESIZE_EDGE_SIZE, bottom: RESIZE_EDGE_SIZE, right: RESIZE_MARGIN, width: RESIZE_EDGE_SIZE, cursor: "ew-resize" }}
                onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.East)}
            />
            <div
                ref={wRef}
                style={{ position: "absolute", zIndex: RESIZE_ZINDEX, top: RESIZE_EDGE_SIZE, bottom: RESIZE_EDGE_SIZE, left: RESIZE_MARGIN, width: RESIZE_EDGE_SIZE, cursor: "ew-resize" }}
                onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.West)}
            />
            <div
                ref={nwRef}
                style={{ position: "absolute", zIndex: RESIZE_ZINDEX, top: RESIZE_MARGIN, left: RESIZE_MARGIN, width: RESIZE_CORNER_SIZE, height: RESIZE_CORNER_SIZE, cursor: "nwse-resize" }}
                onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.NorthWest)}
            />
            <div
                ref={neRef}
                style={{ position: "absolute", zIndex: RESIZE_ZINDEX, top: RESIZE_MARGIN, right: RESIZE_MARGIN, width: RESIZE_CORNER_SIZE, height: RESIZE_CORNER_SIZE, cursor: "nesw-resize" }}
                onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.NorthEast)}
            />
            <div
                ref={swRef}
                style={{ position: "absolute", zIndex: RESIZE_ZINDEX, bottom: RESIZE_MARGIN, left: RESIZE_MARGIN, width: RESIZE_CORNER_SIZE, height: RESIZE_CORNER_SIZE, cursor: "nesw-resize" }}
                onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.SouthWest)}
            />
            <div
                ref={seRef}
                style={{ position: "absolute", zIndex: RESIZE_ZINDEX, bottom: 0, right: 0, width: RESIZE_CORNER_SIZE, height: RESIZE_CORNER_SIZE, cursor: "nwse-resize" }}
                onPointerDown={(e) => onPointerDownResize(e, FloatWindowResizeDirection.SouthEast)}
            />
        </div>
    );

    // const portal = createPortal(content, document.documentElement, layout.getLayoutId());
    // return portal;

    return content;
};
