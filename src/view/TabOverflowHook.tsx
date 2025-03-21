import * as React from "react";
import { TabSetNode } from "../model/TabSetNode";
import { BorderNode } from "../model/BorderNode";
import { Orientation } from "../Orientation";
import { LayoutInternal } from "./Layout";
import { TabNode } from "../model/TabNode";
import { startDrag } from "./Utils";
import { Rect } from "../Rect";

/** @internal */
export const useTabOverflow = (
    layout: LayoutInternal,
    node: TabSetNode | BorderNode,
    orientation: Orientation,
    tabStripRef: React.RefObject<HTMLElement | null>,
    miniScrollRef: React.RefObject<HTMLElement | null>,
    tabClassName: string
) => {
    const [hiddenTabs, setHiddenTabs] = React.useState<number[]>([]);
    const [isShowHiddenTabs, setShowHiddenTabs] = React.useState<boolean>(false);
    const [isDockStickyButtons, setDockStickyButtons] = React.useState<boolean>(false);

    const selfRef = React.useRef<HTMLDivElement | null>(null);
    const userControlledPositionRef = React.useRef<boolean>(false);
    const updateHiddenTabsTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
    const hiddenTabsRef = React.useRef<number[]>([]);
    const thumbInternalPos = React.useRef<number>(0);
    const repositioningRef = React.useRef<boolean>(false);
    hiddenTabsRef.current = hiddenTabs;

    // if node changes (new model) then reset scroll to 0
    React.useLayoutEffect(() => {
        if (tabStripRef.current) {
            setScrollPosition(0);
        }
    }, [node]);

    // if selected node or tabset/border rectangle change then unset usercontrolled (so selected tab will be kept in view)
    React.useLayoutEffect(() => {
        userControlledPositionRef.current = false;
    }, [node.getSelectedNode(), node.getRect().width, node.getRect().height]);

    React.useLayoutEffect(() => {
        checkForOverflow(); // if tabs + sticky buttons length > scroll area => move sticky buttons to right buttons

        if (userControlledPositionRef.current === false) {
            scrollIntoView();
        }

        updateScrollMetrics();
        updateHiddenTabs();
    });

    function scrollIntoView() {
        const selectedTabNode = node.getSelectedNode() as TabNode;
        if (selectedTabNode && tabStripRef.current) {
            const stripRect = layout.getBoundingClientRect(tabStripRef.current);
            const selectedRect = selectedTabNode.getTabRect()!;

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
    }

    const updateScrollMetrics = () => {
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
    }

    const updateHiddenTabs = () => {
        const newHiddenTabs = findHiddenTabs();
        const showHidden = newHiddenTabs.length > 0;

        if (showHidden !== isShowHiddenTabs) {
            setShowHiddenTabs(showHidden);
        }

        if (updateHiddenTabsTimerRef.current === undefined) {
            // throttle updates to prevent Maximum update depth exceeded error
            updateHiddenTabsTimerRef.current = setTimeout(() => {
                const newHiddenTabs = findHiddenTabs();
                if (!arraysEqual(newHiddenTabs, hiddenTabsRef.current)) {
                    setHiddenTabs(newHiddenTabs);
                }

                updateHiddenTabsTimerRef.current = undefined;
            }, 100);
        }
    }

    const onScroll = () => {
        if (!repositioningRef.current){
            userControlledPositionRef.current=true;
        }
        repositioningRef.current = false;
        updateScrollMetrics()
        updateHiddenTabs();
    };

    const onScrollPointerDown = (event: React.PointerEvent<HTMLElement>) => {
        event.stopPropagation();
        miniScrollRef.current!.setPointerCapture(event.pointerId)
        const r = miniScrollRef.current?.getBoundingClientRect()!;
        if (orientation === Orientation.HORZ) {
            thumbInternalPos.current = event.clientX - r.x;
        } else {
            thumbInternalPos.current = event.clientY - r.y;
        }
        startDrag(event.currentTarget.ownerDocument, event, onDragMove, onDragEnd, onDragCancel);
    }

    const onDragMove = (x: number, y: number) => {
        if (tabStripRef.current && miniScrollRef.current) {
            const t = tabStripRef.current;
            const s = miniScrollRef.current;
            const size = getElementSize(t);
            const scrollSize = getScrollSize(t);
            const thumbSize = getElementSize(s);

            const r = t.getBoundingClientRect()!;
            let thumb = 0;
            if (orientation === Orientation.HORZ) {
                thumb = x - r.x - thumbInternalPos.current;
            } else {
                thumb = y - r.y - thumbInternalPos.current
            }

            thumb = Math.max(0, Math.min(scrollSize - thumbSize, thumb));
            if (size > 0) {
                const scrollPos = thumb * scrollSize / size;
                setScrollPosition(scrollPos);
            }
        }
    }

    const onDragEnd = () => {
    }

    const onDragCancel = () => {
    }

    const checkForOverflow = () => {
        if (tabStripRef.current) {
            const strip = tabStripRef.current;
            const tabContainer = strip.firstElementChild!;

            const offset = isDockStickyButtons ? 10 : 0; // prevents flashing, after sticky buttons docked set, must be 10 pixels smaller before unsetting
            const dock = (getElementSize(tabContainer) + offset) > getElementSize(tabStripRef.current);
            if (dock !== isDockStickyButtons) {
                setDockStickyButtons(dock);
            }
        }
    }

    const findHiddenTabs: () => number[] = () => {
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
    };

    const onMouseWheel = (event: React.WheelEvent<HTMLElement>) => {
        if (tabStripRef.current) {
            if (node.getChildren().length === 0) return;

            let delta = 0;
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
    };

    // orientation helpers:

    const getNear = (rect: DOMRect | Rect) => {
        if (orientation === Orientation.HORZ) {
            return rect.x;
        } else {
            return rect.y;
        }
    };

    const getFar = (rect: DOMRect | Rect) => {
        if (orientation === Orientation.HORZ) {
            return rect.right;
        } else {
            return rect.bottom;
        }
    };

    const getElementSize = (elm: Element) => {
        if (orientation === Orientation.HORZ) {
            return elm.clientWidth;
        } else {
            return elm.clientHeight;
        }
    }

    const getSize = (rect: DOMRect | Rect) => {
        if (orientation === Orientation.HORZ) {
            return rect.width;
        } else {
            return rect.height;
        }
    }

    const getScrollSize = (elm: Element) => {
        if (orientation === Orientation.HORZ) {
            return elm.scrollWidth;
        } else {
            return elm.scrollHeight;
        }
    }

    const setScrollPosition = (p: number) => {
        if (orientation === Orientation.HORZ) {
            tabStripRef.current!.scrollLeft = p;
        } else {
            tabStripRef.current!.scrollTop = p;
        }
    }

    const getScrollPosition = (elm: Element) => {
        if (orientation === Orientation.HORZ) {
            return elm.scrollLeft;
        } else {
            return elm.scrollTop;
        }
    }

    return { selfRef, userControlledPositionRef, onScroll, onScrollPointerDown, hiddenTabs, onMouseWheel, isDockStickyButtons, isShowHiddenTabs };
};

function arraysEqual(arr1: number[], arr2: number[]) {
    return arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
}
