import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { Actions, IJsonTabNode, ILayoutProps, Layout, TabNode } from "../../src/index";

export function TabStorage({ tab, layout }: { tab: TabNode; layout: Layout; }) {
    const [storedTabs, setStoredTabs] = useState<IJsonTabNode[]>(tab.getConfig()?.storedTabs ?? []);

    useEffect(() => {
        tab.getModel().doAction(Actions.updateNodeAttributes(tab.getId(), { config: { ...(tab.getConfig() ?? {}), storedTabs } }));
    }, [storedTabs]);

    const [contents, setContents] = useState<HTMLDivElement | null>(null);
    const [list, setList] = useState<HTMLDivElement | null>(null);
    const refs = useRef<Map<string, HTMLDivElement | undefined>>(new Map()).current;
    const [emptyElem, setEmptyElem] = useState<HTMLDivElement | null>(null);

    // true = down, false = up, null = none
    const [scrollDown, setScrollDown] = useState<boolean | null>(null);

    const scrollInvalidateRef = useRef<() => void>();
    const scroller = useCallback((isDown: boolean) => {
        contents?.scrollBy(0, isDown ? 10 : -10);
        scrollInvalidateRef.current?.();
    }, [contents]);

    const scrollerRef = useRef(scroller);
    scrollerRef.current = scroller;

    useEffect(() => {
        if (scrollDown !== null) {
            let scrollInterval: NodeJS.Timeout;
            let scrollTimeout = setTimeout(() => {
                scrollerRef.current(scrollDown);
                scrollInterval = setInterval(() => scrollerRef.current(scrollDown), 50);
            }, 500);

            return () => {
                clearTimeout(scrollTimeout);
                clearInterval(scrollInterval);
            };
        }

        return;
    }, [scrollDown]);

    const kickstartingCallback = useCallback((dragging: TabNode | IJsonTabNode) => {
        const json = dragging instanceof TabNode ? dragging.toJson() as IJsonTabNode : dragging;

        if (json.id === undefined) {
            json.id = `#${v4()}`;
        }

        setStoredTabs(tabs => [...tabs, json]);

        if (dragging instanceof TabNode) {
            tab.getModel().doAction(Actions.deleteTab(dragging.getId()));
        }
    }, [tab]);

    const calculateInsertion = useCallback((absoluteY: number) => {
        const rects = storedTabs.map(json => refs.get(json.id!)!.getBoundingClientRect());

        const splits = [rects[0].top];

        for (let i = 1; i < rects.length; i++) {
            splits.push((rects[i - 1].bottom + rects[i].top) / 2);
        }

        splits.push(rects[rects.length - 1].bottom);

        let insertionIndex = 0;

        for (let i = 1; i < splits.length; i++) {
            if (Math.abs(splits[i] - absoluteY) <= Math.abs(splits[insertionIndex] - absoluteY)) {
                insertionIndex = i;
            }
        }

        return {
            insertionIndex,
            split: splits[insertionIndex]
        };
    }, [storedTabs]);

    const insertionCallback = useCallback((dragging: TabNode | IJsonTabNode, _: any, __: any, y: number) => {
        const absoluteY = y + tab.getRect().y + layout.getDomRect().top;
        const { insertionIndex } = calculateInsertion(absoluteY);
        const json = dragging instanceof TabNode ? dragging.toJson() as IJsonTabNode : dragging;

        if (json.id === undefined) {
            json.id = `#${v4()}`;
        }

        setStoredTabs(tabs => {
            const newTabs = [...tabs];
            const foundAt = newTabs.indexOf(json);

            if (foundAt > -1) {
                newTabs.splice(foundAt, 1);
                newTabs.splice(insertionIndex > foundAt ? insertionIndex - 1 : insertionIndex, 0, json);
            } else {
                newTabs.splice(insertionIndex, 0, json);
            }

            return newTabs;
        });

        setScrollDown(null);

        if (dragging instanceof TabNode) {
            tab.getModel().doAction(Actions.deleteTab(dragging.getId()));
        }
    }, [calculateInsertion, tab, layout]);

    tab.getExtraData().tabStorage_onTabDrag = useCallback(((dragging, over, x, y, _, refresh) => {
        if (contents && list) {
            const layoutDomRect = layout.getDomRect();
            const tabRect = tab.getRect();

            const rootX = tabRect.x + layoutDomRect.left;
            const rootY = tabRect.y + layoutDomRect.top;
            const absX = x + rootX;
            const absY = y + rootY;

            const listBounds = list.getBoundingClientRect();
            if (absX < listBounds.left || absX >= listBounds.right ||
                absY < listBounds.top || absY >= listBounds.bottom)
                return;

            if (emptyElem) {
                return {
                    x: listBounds.left - rootX,
                    y: listBounds.top - rootY,
                    width: listBounds.width,
                    height: listBounds.height,
                    callback: kickstartingCallback,
                    cursor: 'copy'
                };
            } else {
                const insertion = calculateInsertion(absY);

                scrollInvalidateRef.current = refresh;

                if (absY - rootY < tabRect.height / 5) {
                    setScrollDown(false);
                } else if (absY - rootY > tabRect.height * 4 / 5) {
                    setScrollDown(true);
                } else {
                    setScrollDown(null);
                }

                return {
                    x: listBounds.left - rootX,
                    y: insertion.split - rootY - 2,
                    width: listBounds.width,
                    height: 0,
                    callback: insertionCallback,
                    invalidated: () => setScrollDown(null),
                    cursor: 'row-resize'
                };
            }
        }

        return undefined;
    }) as Required<ILayoutProps>['onTabDrag'], [storedTabs, contents, list, refs, emptyElem]);

    return <div ref={setContents} className="tab-storage">
        <p>
            This component demonstrates the custom drag and drop features of FlexLayout, by allowing you to store tabs in a list.
            You can drag tabs into the list, reorder the list, and drag tabs out of the list, all using the layout's built-in drag system!
        </p>
        <div ref={setList} className="tab-storage-tabs">
            {storedTabs.length === 0 && <div ref={setEmptyElem} className="tab-storage-empty">Looks like there's nothing here! Try dragging a tab over this text.</div>}
            {storedTabs.map((stored, i) => (
                <div
                    ref={ref => ref ? refs.set(stored.id!, ref) : refs.delete(stored.id!)}
                    className="tab-storage-entry"
                    key={stored.id}
                    onMouseDown={e => {
                        e.preventDefault();
                        layout.addTabWithDragAndDrop(stored.name ?? 'Unnamed', stored, (node) => node && setStoredTabs(tabs => tabs.filter(tab => tab !== stored)));
                    }}
                    onTouchStart={e => {
                        layout.addTabWithDragAndDrop(stored.name ?? 'Unnamed', stored, (node) => node && setStoredTabs(tabs => tabs.filter(tab => tab !== stored)));
                    }}
                >
                    {stored.name ?? 'Unnamed'}
                </div>))}
        </div>
    </div>;
}
