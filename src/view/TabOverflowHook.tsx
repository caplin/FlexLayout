import * as React from "react";
import { TabSetNode } from "../model/TabSetNode";
import { BorderNode } from "../model/BorderNode";
import { Orientation } from "../Orientation";
import { LayoutInternal } from "./Layout";
import { TabNode } from "../model/TabNode";
import { startDrag } from "./Utils";

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
    const [isTabOverflow, setTabOverflow] = React.useState<boolean>(false);

    const selfRef = React.useRef<HTMLDivElement | null>(null);
    const userControlledPositionRef = React.useRef<boolean>(false);
    const updateHiddenTabsTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
    const hiddenTabsRef = React.useRef<number[]>([]);
    const thumbInternalPos = React.useRef<number>(0);
    hiddenTabsRef.current = hiddenTabs;

    // if node changes (new model) then reset scroll to 0
    React.useEffect(() => {
        if (tabStripRef.current) {
            setScrollPosition(0);
        }
    }, [node]);
    
    // if selected node or tabset/border rectangle change then unset usercontrolled (so selected tab will be kept in view)
    React.useEffect(() => {
        userControlledPositionRef.current = false;
    }, [node.getSelectedNode(), node.getRect().width, node.getRect().height]);

    React.useEffect(() => {
        checkForOverflow(); // if tabs + sticky buttons length > scroll area => move sticky buttons to right buttons

        if (!userControlledPositionRef.current) {
            const selectedTab = findSelectedTab();
            if (selectedTab) {
                selectedTab.scrollIntoView();
            }
        }

        updateHiddenTabs();
        updateScrollMetrics();
    });

    const updateScrollMetrics = () => {
        if (tabStripRef.current && miniScrollRef.current) {
            const t = tabStripRef.current;
            const s = miniScrollRef.current;

            const size = getSize(t);
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

    const updateTabRects = () => {
        if (tabStripRef.current) {
            const tabContainer = tabStripRef.current.firstElementChild!;

            const nodeChildren = node.getChildren();
            let i = 0;
            Array.from(tabContainer.children).forEach((child) => {
                if (child.classList.contains(tabClassName)) {
                    const childNode = nodeChildren[i] as TabNode;
                    childNode.setTabRect(layout.getBoundingClientRect(child as HTMLElement));
                    i++;
                }
            });
        }
    }

    const onScroll = () => {
        userControlledPositionRef.current = true;
        updateTabRects();
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
        userControlledPositionRef.current = true;
        startDrag(event.currentTarget.ownerDocument, event, onDragMove, onDragEnd, onDragCancel);
    }

    const onDragMove = (x: number, y: number) => {
        if (tabStripRef.current && miniScrollRef.current) {
            const t = tabStripRef.current;
            const s = miniScrollRef.current;
            const size = getSize(t);
            const scrollSize = getScrollSize(t);
            const thumbSize = getSize(s);

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

    const findSelectedTab: () => Element | undefined = () => {
        let found: Element | undefined = undefined;
        if (tabStripRef.current) {
            const tabContainer = tabStripRef.current.firstElementChild!;

            Array.from(tabContainer.children).forEach((child) => {
                if (child.classList.contains(tabClassName + "--selected")) {
                    found = child;
                }
            });
        }
        return found;
    };

    const checkForOverflow = () => {
        if (tabStripRef.current) {
            const strip = tabStripRef.current;
            const tabContainer = strip.firstElementChild!;

            const offset = isTabOverflow ? 10 : 0; // prevents flashing, after sticky buttons docked set, must be 10 pixels smaller before unsetting
            const dock = (getSize(tabContainer) + offset) > getSize(tabStripRef.current);
            if (dock !== isTabOverflow) {
                setTabOverflow(dock);
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
                const maxScroll = getScrollSize(tabStripRef.current) - getSize(tabStripRef.current);
                const p = Math.max(0, Math.min(maxScroll, newPos));
                setScrollPosition(p);
                updateTabRects();
                updateHiddenTabs();
                userControlledPositionRef.current = true;
                event.stopPropagation();
            }
        }
    };

    // orientation helpers:

    const getNear = (rect: DOMRect) => {
        if (orientation === Orientation.HORZ) {
            return rect.x;
        } else {
            return rect.y;
        }
    };

    const getFar = (rect: DOMRect) => {
        if (orientation === Orientation.HORZ) {
            return rect.right;
        } else {
            return rect.bottom;
        }
    };

    const getSize = (elm: Element) => {
        if (orientation === Orientation.HORZ) {
            return elm.clientWidth;
        } else {
            return elm.clientHeight;
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

    return { selfRef, userControlledPositionRef, onScroll, onScrollPointerDown, hiddenTabs, onMouseWheel, isTabOverflow };
};

function arraysEqual(arr1: number[], arr2: number[]) {
    return arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
}
