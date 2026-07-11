import * as React from "react";
import { TabSetNode } from "../model/TabSetNode";
import { BorderNode } from "../model/BorderNode";
import { Orientation } from "../model/Orientation";
import { LayoutController } from "./layout/LayoutInternal";
import { TabNode } from "../model/TabNode";
import { domId, startDrag } from "./Utils";
import { Rect } from "../model/Rect";

/** @internal */
export const useTabOverflow = (
    controller: LayoutController,
    node: TabSetNode | BorderNode,
    orientation: Orientation,
    tabStripRef: React.RefObject<HTMLElement | null>,
    miniScrollRef: React.RefObject<HTMLElement | null>,
    wheelRef: React.RefObject<HTMLElement | null>, // element whose wheel events scroll the tabs (needed to preventDefault, since React wheel listeners are passive)
    tabClassName: string
) => {
    const [hiddenTabs, setHiddenTabs] = React.useState<number[]>([]);
    const [isShowHiddenTabs, setShowHiddenTabs] = React.useState<boolean>(false);
    const [isDockStickyButtons, setDockStickyButtons] = React.useState<boolean>(false);

    const userControlledPositionRef = React.useRef<boolean>(false);
    const updateHiddenTabsTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const hiddenTabsRef = React.useRef<number[]>([]);
    const thumbInternalPos = React.useRef<number>(0);
    const repositioningRef = React.useRef<boolean>(false);

    React.useEffect(() => {
        return () => {
            if (updateHiddenTabsTimerRef.current !== undefined) {
                clearTimeout(updateHiddenTabsTimerRef.current);
            }
        };
    }, []);

    React.useLayoutEffect(() => {
        hiddenTabsRef.current = hiddenTabs;
    });

    const setScrollPosition = React.useCallback((p: number) => {
        if (orientation === Orientation.HORZ) {
            tabStripRef.current!.scrollLeft = p;
        } else {
            tabStripRef.current!.scrollTop = p;
        }
    }, [orientation, tabStripRef]);

    const getScrollPosition = React.useCallback((elm: Element) => {
        if (orientation === Orientation.HORZ) {
            return elm.scrollLeft;
        } else {
            return elm.scrollTop;
        }
    }, [orientation]);

    const getElementSize = React.useCallback((elm: Element) => {
        if (orientation === Orientation.HORZ) {
            return elm.clientWidth;
        } else {
            return elm.clientHeight;
        }
    }, [orientation]);

    const getScrollSize = React.useCallback((elm: Element) => {
        if (orientation === Orientation.HORZ) {
            return elm.scrollWidth;
        } else {
            return elm.scrollHeight;
        }
    }, [orientation]);

    const getSize = React.useCallback((rect: DOMRect | Rect) => {
        if (orientation === Orientation.HORZ) {
            return rect.width;
        } else {
            return rect.height;
        }
    }, [orientation]);

    const getNear = React.useCallback((rect: DOMRect | Rect) => {
        if (orientation === Orientation.HORZ) {
            return rect.x;
        } else {
            return rect.y;
        }
    }, [orientation]);

    const getFar = React.useCallback((rect: DOMRect | Rect) => {
        if (orientation === Orientation.HORZ) {
            return rect.right;
        } else {
            return rect.bottom;
        }
    }, [orientation]);

    const findHiddenTabs = React.useCallback((): number[] => {
        const hidden: number[] = [];
        if (tabStripRef.current) {
            const strip = tabStripRef.current;
            const stripRect = strip.getBoundingClientRect();
            const visibleNear = getNear(stripRect) - 1;
            const visibleFar = getFar(stripRect) + 1;

            const tabContainer = strip.firstElementChild!;

            let i = 0;
            Array.from(tabContainer.children).forEach((child) => {
                const tabRect = child.getBoundingClientRect();

                if (child.classList.contains(tabClassName)) {
                    if (getNear(tabRect) < visibleNear || getFar(tabRect) > visibleFar) {
                        hidden.push(i);
                    }
                    i++;
                }
            });
        }

        return hidden;
    }, [tabClassName, tabStripRef, getNear, getFar]);

    const updateScrollMetrics = React.useCallback(() => {
        if (tabStripRef.current && miniScrollRef.current) {
            const t = tabStripRef.current;
            const s = miniScrollRef.current;

            const size = getElementSize(t);
            const scrollSize = getScrollSize(t);
            const position = getScrollPosition(t);

            if (scrollSize > size && scrollSize > 0) {
                let thumbSize = size * size / scrollSize;
                let adjust = 0;
                if (thumbSize < 20) {
                    adjust = 20 - thumbSize;
                    thumbSize = 20;
                }
                const thumbPos = position * (size - adjust) / scrollSize;
                if (orientation === Orientation.HORZ) {
                    s.style.width = thumbSize + "px";
                    s.style.left = thumbPos + "px";
                } else {
                    s.style.height = thumbSize + "px";
                    s.style.top = thumbPos + "px";
                }
                s.style.display = "block";
            } else {
                s.style.display = "none";
            }

            if (orientation === Orientation.HORZ) {
                s.style.bottom = "0px";
            } else {
                s.style.right = "0px";
            }
        }
    }, [orientation, tabStripRef, miniScrollRef, getElementSize, getScrollSize, getScrollPosition]);

    const updateHiddenTabs = React.useCallback((isInitial = false) => {
        const newHiddenTabs = findHiddenTabs();
        const showHidden = newHiddenTabs.length > 0;

        if (showHidden !== isShowHiddenTabs) {
            setShowHiddenTabs(showHidden);
        }

        if (isInitial) {
            setHiddenTabs(newHiddenTabs);
        } else if (updateHiddenTabsTimerRef.current === undefined) {
            // throttle updates to prevent Maximum update depth exceeded error
            updateHiddenTabsTimerRef.current = setTimeout(() => {
                const currentHiddenTabs = findHiddenTabs();
                if (!arraysEqual(currentHiddenTabs, hiddenTabsRef.current)) {
                    setHiddenTabs(currentHiddenTabs);
                }

                updateHiddenTabsTimerRef.current = undefined;
            }, 100);
        }
    }, [findHiddenTabs, isShowHiddenTabs]);

    const scrollIntoView = React.useCallback(() => {
        const selectedTabNode = node.getSelectedNode() as TabNode;
        if (selectedTabNode && tabStripRef.current) {
            const stripRect = controller.getBoundingClientRect(tabStripRef.current);
            // measure the button from the dom (the model tabRect is only updated in the layout central
            // measure pass, which runs after this effect)
            const buttonElement = tabStripRef.current.ownerDocument.getElementById(domId("flexlayout-tabbutton-", selectedTabNode.getId()));
            if (!buttonElement) {
                return;
            }
            const selectedRect = controller.getBoundingClientRect(buttonElement);

            let shift = getNear(stripRect) - getNear(selectedRect);
            if (shift > 0 || getSize(selectedRect) > getSize(stripRect)) {
                setScrollPosition(getScrollPosition(tabStripRef.current) - shift);
                repositioningRef.current = true; // prevent onScroll setting userControlledPosition
            } else {
                shift = getFar(selectedRect) - getFar(stripRect);
                if (shift > 0) {
                    setScrollPosition(getScrollPosition(tabStripRef.current) + shift);
                    repositioningRef.current = true;
                }
            }
        }
    }, [node, controller, tabStripRef, getNear, getFar, getSize, getScrollPosition, setScrollPosition]);

    const checkForOverflow = React.useCallback(() => {
        if (tabStripRef.current) {
            const strip = tabStripRef.current;
            // sum the strip's children: the tab container plus the sticky buttons bar (which
            // renders as a sibling of the tablist element, not inside it)
            let contentSize = 0;
            for (const child of Array.from(strip.children)) {
                contentSize += getElementSize(child);
            }

            const offset = isDockStickyButtons ? 10 : 0; // prevents flashing, after sticky buttons docked set, must be 10 pixels smaller before unsetting
            const dock = (contentSize + offset) > getElementSize(tabStripRef.current);
            if (dock !== isDockStickyButtons) {
                setDockStickyButtons(dock);
            }
        }
    }, [tabStripRef, isDockStickyButtons, getElementSize]);

    const onScroll = React.useCallback(() => {
        if (!repositioningRef.current) {
            userControlledPositionRef.current = true;
        }
        repositioningRef.current = false;
        updateScrollMetrics();
        updateHiddenTabs();
    }, [updateScrollMetrics, updateHiddenTabs]);

    const onDragMove = React.useCallback((x: number, y: number) => {
        if (tabStripRef.current && miniScrollRef.current) {
            const t = tabStripRef.current;
            const s = miniScrollRef.current;
            const size = getElementSize(t);
            const scrollSize = getScrollSize(t);
            const thumbSize = getElementSize(s);

            const r = t.getBoundingClientRect()!;
            let thumb: number;
            if (orientation === Orientation.HORZ) {
                thumb = x - r.x - thumbInternalPos.current;
            } else {
                thumb = y - r.y - thumbInternalPos.current;
            }

            thumb = Math.max(0, Math.min(scrollSize - thumbSize, thumb));
            if (size > 0) {
                const scrollPos = thumb * scrollSize / size;
                setScrollPosition(scrollPos);
            }
        }
    }, [tabStripRef, miniScrollRef, orientation, getElementSize, getScrollSize, setScrollPosition]);

    const onDragEnd = React.useCallback(() => { }, []);
    const onDragCancel = React.useCallback(() => { }, []);

    const onScrollPointerDown = React.useCallback((event: React.PointerEvent<HTMLElement>) => {
        event.stopPropagation();
        miniScrollRef.current!.setPointerCapture(event.pointerId);
        const r = miniScrollRef.current!.getBoundingClientRect()!;
        if (orientation === Orientation.HORZ) {
            thumbInternalPos.current = event.clientX - r.x;
        } else {
            thumbInternalPos.current = event.clientY - r.y;
        }
        startDrag(event.currentTarget.ownerDocument, event, onDragMove, onDragEnd, onDragCancel);
    }, [miniScrollRef, orientation, onDragMove, onDragEnd, onDragCancel]);

    const onMouseWheel = React.useCallback((event: React.WheelEvent<HTMLElement>) => {
        if (tabStripRef.current) {
            if (node.getChildren().length === 0) return;

            let delta: number;
            if (Math.abs(event.deltaY) > 0) {
                delta = -event.deltaY;
                if (event.deltaMode === 1) {
                    // DOM_DELTA_LINE	0x01	The delta values are specified in lines.
                    delta *= 40;
                }
                const newPos = getScrollPosition(tabStripRef.current) - delta;
                const maxScroll = getScrollSize(tabStripRef.current) - getElementSize(tabStripRef.current);
                const p = Math.max(0, Math.min(maxScroll, newPos));
                setScrollPosition(p);
                event.stopPropagation();
            }
        }
    }, [node, tabStripRef, getScrollPosition, getScrollSize, getElementSize, setScrollPosition]);

    const onWheel = React.useCallback((event: Event) => {
        event.preventDefault();
    }, []);

    const nodeId = node.getId();
    const selectedNode = node.getSelectedNode();

    // if node id changes (new model) then reset scroll to 0
    React.useLayoutEffect(() => {
        if (tabStripRef.current) {
            setScrollPosition(0);
        }
    }, [nodeId, tabStripRef, setScrollPosition]);

    // if the selected node changes then unset usercontrolled (so the selected tab will be kept in view)
    React.useLayoutEffect(() => {
        userControlledPositionRef.current = false;
    }, [selectedNode]);

    React.useLayoutEffect(() => {
        checkForOverflow(); // if tabs + sticky buttons length > scroll area => move sticky buttons to right buttons

        if (userControlledPositionRef.current === false) {
            scrollIntoView();
        }

        updateScrollMetrics();

        // Initial calculation to prevent flash
        // eslint-disable-next-line react-hooks/set-state-in-effect
        updateHiddenTabs(true);

        requestAnimationFrame(() => {
            updateHiddenTabs();
        });
    }, [checkForOverflow, scrollIntoView, updateScrollMetrics, updateHiddenTabs, orientation, selectedNode]);

    // strip geometry changes no longer cause a react render (they are applied imperatively by the
    // layout), so watch the strip element itself for size changes
    React.useLayoutEffect(() => {
        const strip = tabStripRef.current;
        if (!strip) {
            return;
        }
        const resizeObserver = new (strip.ownerDocument.defaultView!).ResizeObserver(() => {
            userControlledPositionRef.current = false;
            checkForOverflow();
            scrollIntoView();
            updateScrollMetrics();
            updateHiddenTabs();
        });
        resizeObserver.observe(strip);
        return () => resizeObserver.disconnect();
    }, [checkForOverflow, scrollIntoView, updateScrollMetrics, updateHiddenTabs, tabStripRef]);

    // no deps: the strip element can change between renders (e.g. tab wrap toggled)
    React.useEffect(() => {
        if (node instanceof TabSetNode && node.isEnableTabWrap()) {
            return; // wrapping tab strips show all tabs, wheel should scroll the page as normal
        }
        const strip = wheelRef.current;
        strip?.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            strip?.removeEventListener("wheel", onWheel);
        };
    });

    return { userControlledPositionRef, onScroll, onScrollPointerDown, hiddenTabs, onMouseWheel, isDockStickyButtons, isShowHiddenTabs };
};

function arraysEqual(arr1: number[], arr2: number[]) {
    return arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
}
