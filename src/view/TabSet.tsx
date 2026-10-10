import * as React from "react";
import { I18nLabel } from "./I18nLabel";
import { Actions } from "../model/Actions";
import { TabNode } from "../model/TabNode";
import { TabSetNode } from "../model/TabSetNode";
import { TabGroupNode } from "../model/TabGroupNode";
import { GroupPill } from "./GroupPill";
import { GroupEndMarker } from "./GroupEndMarker";
import { showOverflowMenu } from "./PopupMenu";
import { ITabSetRenderValues } from "./layout/LayoutTypes";
import { LayoutController } from "./layout/LayoutInternal";
import { TabButton } from "./TabButton";
import { useTabOverflow } from "./TabOverflowHook";
import { Orientation } from "../model/Orientation";
import { CLASSES } from "../CSSClassNames";
import { isAuxMouseEvent, tabButtonPath, toAriaKeyShortcuts } from "./Utils";
import { createPortal } from "react-dom";
import { getFlexStyle } from "./FlexStyle";

/** @internal */
export interface ITabSetProps {
    controller: LayoutController;
    tabsetNode: TabSetNode;
}

/** @internal */
export const TabSet = (props: ITabSetProps) => {
    const { tabsetNode, controller } = props;

    // Must define `selfRef` before it is used in `useLayoutEffect`
    const selfRef = React.useRef<HTMLDivElement>(null);
    const tabStripRef = React.useRef<HTMLDivElement>(null);
    const miniScrollRef = React.useRef<HTMLDivElement>(null);
    const tabStripInnerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const buttonBarRef = React.useRef<HTMLDivElement>(null);
    const overflowbuttonRef = React.useRef<HTMLButtonElement>(null);
    const stickyButtonsRef = React.useRef<HTMLDivElement>(null);
    const [overflowMenuOpen, setOverflowMenuOpen] = React.useState(false);
    const hideOverflowRef = React.useRef<(() => void) | null>(null);

    const icons = controller.getIcons();

    // cleanup: close overflow menu on unmount to prevent listener/portal leak
    React.useEffect(() => () => hideOverflowRef.current?.(), []);

    // must be after useEffect so the node rect is already set
    const { userControlledPositionRef, onScroll, onScrollPointerDown, hiddenTabs, onMouseWheel, isDockStickyButtons, isShowHiddenTabs } = useTabOverflow(
        controller,
        tabsetNode,
        Orientation.HORZ,
        tabStripInnerRef,
        miniScrollRef,
        tabStripRef,
        controller.getClassName(CLASSES.FLEXLAYOUT__TAB_BUTTON),
        stickyButtonsRef,
    );

    // callback refs: fire on attach/detach including remounts, unlike effects
    const setSelfRef = React.useCallback(
        (element: HTMLDivElement | null) => {
            selfRef.current = element;
            controller.registerMeasurable(tabsetNode, "tabset", element);
        },
        [controller, tabsetNode],
    );
    const setTabStripRef = React.useCallback(
        (element: HTMLDivElement | null) => {
            tabStripRef.current = element;
            controller.registerMeasurable(tabsetNode, "tabstrip", element);
        },
        [controller, tabsetNode],
    );
    const setContentRef = React.useCallback(
        (element: HTMLDivElement | null) => {
            contentRef.current = element;
            controller.registerMeasurable(tabsetNode, "tabsetcontent", element);
        },
        [controller, tabsetNode],
    );

    const onOverflowClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const callback = controller.getShowOverflowMenu();
        const tabs = tabsetNode.getTabNodes();
        const items = hiddenTabs.map((h) => {
            return { index: h, node: tabs[h] };
        });
        if (callback !== undefined) {
            callback(tabsetNode, event, items, onOverflowItemSelect);
        } else {
            const element = overflowbuttonRef.current!;
            setOverflowMenuOpen(true);
            hideOverflowRef.current = showOverflowMenu(element, tabsetNode, items, onOverflowItemSelect, controller, () => {
                setOverflowMenuOpen(false);
                hideOverflowRef.current = null;
            });
        }
        event.stopPropagation();
    };

    const onOverflowItemSelect = (item: { node: TabNode; index: number }) => {
        controller.doAction(Actions.selectTab(item.node.getId()));
        userControlledPositionRef.current = false;
    };

    const onDragStart = (event: React.DragEvent<HTMLElement>) => {
        if (!controller.getEditingTab()) {
            if (tabsetNode.isEnableDrag()) {
                event.stopPropagation();
                controller.getDragDropManager().setDragNode(event.nativeEvent, tabsetNode as TabSetNode);
            } else {
                event.preventDefault();
            }
        } else {
            event.preventDefault();
        }
    };

    const onDragEnd = (_event: React.DragEvent<HTMLElement>) => {
        controller.getDragDropManager().onDragEnded();
    };

    const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
        if (!isAuxMouseEvent(event) && !tabsetNode.isActive()) {
            controller.doAction(Actions.setActiveTabset(tabsetNode.getId(), controller.getLayoutId()));
        }
    };

    const onAuxMouseClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (isAuxMouseEvent(event)) {
            controller.auxMouseClick(tabsetNode, event);
        }
    };

    const onContextMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        controller.showContextMenu(tabsetNode, event);
    };

    const onInterceptPointerDown = (event: React.PointerEvent) => {
        event.stopPropagation();
    };

    const onMaximizeToggle = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (tabsetNode.canMaximize()) {
            controller.maximize(tabsetNode);
        }
        event.stopPropagation();
    };

    const onClose = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        controller.doAction(Actions.deleteTabset(tabsetNode.getId()));
        event.stopPropagation();
    };

    const onCloseTab = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        controller.doAction(Actions.deleteTab(tabsetNode.getChildren()[0].getId()));
        event.stopPropagation();
    };

    const onPopoutWindow = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (selectedTabNode !== undefined) {
            controller.doAction(Actions.popoutTab(selectedTabNode.getId(), "window"));
        }
        event.stopPropagation();
    };

    const onPopoutFloat = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (selectedTabNode !== undefined) {
            controller.doAction(Actions.popoutTab(selectedTabNode.getId(), "float"));
        }
        event.stopPropagation();
    };

    const onDoubleClick = (_event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (tabsetNode.canMaximize()) {
            controller.maximize(tabsetNode);
        }
    };

    // Start Render

    const cm = controller.getClassName;
    const selectedTabNode = tabsetNode.getSelectedNode() as TabNode | undefined;
    const path = tabsetNode.getPath();
    const children = tabsetNode.getChildren();
    const isSingleTabStretched = tabsetNode.isEnableSingleTabStretch() && children.length === 1 && children[0] instanceof TabNode;

    const makeSpacer = (key: number, isSelected: boolean, lastOneSelected: boolean, showDivider: boolean) => {
        let cns = cm(CLASSES.FLEXLAYOUT__TABSET_TAB_SPACER);
        if (showDivider) {
            cns += " " + cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER);
        }
        if (!tabsetNode.isEnableTabWrap() && !isSingleTabStretched) {
            if (isSelected) {
                cns += " " + cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER_SELECTED_BEFORE);
            } else if (lastOneSelected) {
                cns += " " + cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER_SELECTED_AFTER);
            }
        }
        return (
            <div key={"divider" + key} className={cns}>
                <div className={cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER_INNER)}></div>
            </div>
        );
    };

    const renderTabs = () => {
        const tabs = [];
        const isSplitPill = controller.getModel().getTabGroupType() === "splitpill";
        let flatIndex = 0;
        let spacerKey = 0;
        let lastOneSelected = false;
        let lastWasTab = false;
        let hasPrev = false;
        if (tabsetNode.isEnableTabStrip()) {
            for (const child of children) {
                if (child instanceof TabGroupNode) {
                    // a divider spacer before the pill, like before any other tab
                    tabs.push(makeSpacer(spacerKey++, false, lastOneSelected, hasPrev));
                    tabs.push(<GroupPill key={child.getId()} controller={controller} groupNode={child} path={child.getPath()} />);
                    hasPrev = true;
                    lastWasTab = false;
                    if (child.isOpened()) {
                        const groupTabs = child.getChildren() as TabNode[];
                        for (let j = 0; j < groupTabs.length; j++) {
                            const groupTab = groupTabs[j];
                            const isSelected = tabsetNode.getSelected() === flatIndex;
                            // the pill leads its own tabs, so only later group tabs get a divider
                            tabs.push(makeSpacer(spacerKey++, isSelected, lastOneSelected, j > 0));
                            tabs.push(<TabButton controller={controller} tabNode={groupTab} path={tabButtonPath(groupTab)} key={groupTab.getId()} selected={isSelected} />);
                            lastOneSelected = isSelected;
                            lastWasTab = true;
                            hasPrev = true;
                            flatIndex++;
                        }
                        // end marker closes the split pill (right cap, no behaviour)
                        if (isSplitPill) {
                            tabs.push(makeSpacer(spacerKey++, false, lastOneSelected, false));
                            tabs.push(<GroupEndMarker key={child.getId() + "/end"} controller={controller} groupNode={child} path={child.getPath() + "/end"} />);
                            lastOneSelected = false; // end marker is not a tab; don't propagate selection to next divider
                        }
                    }
                    continue;
                }
                const tab = child as TabNode;
                const isSelected = tabsetNode.getSelected() === flatIndex;
                tabs.push(makeSpacer(spacerKey++, isSelected, lastOneSelected, hasPrev));
                tabs.push(<TabButton controller={controller} tabNode={tab} path={tabButtonPath(tab)} key={tab.getId()} selected={isSelected} />);
                lastOneSelected = isSelected;
                lastWasTab = true;
                hasPrev = true;
                flatIndex++;
            }
            if (lastWasTab) {
                let cns = cm(CLASSES.FLEXLAYOUT__TABSET_TAB_SPACER);
                if (!tabsetNode.isEnableTabWrap() && !isSingleTabStretched && lastOneSelected) {
                    cns += " " + cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER_SELECTED_AFTER);
                }
                tabs.push(
                    <div key={"divider" + spacerKey} className={cns}>
                        <div className={cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER_INNER)}></div>
                    </div>,
                );
            }
        }
        return tabs;
    };

    const renderButtons = () => {
        let leading: React.ReactNode = undefined;
        let stickyButtons: React.ReactNode[] = [];
        let buttons: React.ReactNode[] = [];

        // allow customization of header contents and buttons
        const renderState: ITabSetRenderValues = { leading, stickyButtons, buttons, overflowPosition: undefined };
        controller.customizeTabSet(tabsetNode, renderState);
        leading = renderState.leading;
        stickyButtons = renderState.stickyButtons;
        buttons = renderState.buttons;

        const isTabStretch = isSingleTabStretched;
        let showClose = (isTabStretch && (tabsetNode.getChildren()[0] as TabNode).isCloseable()) || tabsetNode.isCloseable();
        showClose = showClose && tabsetNode.isEnableCloseButton();

        if (renderState.overflowPosition === undefined) {
            renderState.overflowPosition = stickyButtons.length;
        }

        // sticky bar outside tablist (tablist may only contain tab children)
        let stickyBar: React.ReactNode = undefined;
        if (stickyButtons.length > 0) {
            if (!tabsetNode.isEnableTabWrap() && (isDockStickyButtons || isTabStretch)) {
                buttons = [...stickyButtons, ...buttons];
            } else {
                stickyBar = (
                    <div
                        ref={stickyButtonsRef}
                        key="sticky_buttons_container"
                        onPointerDown={onInterceptPointerDown}
                        onDragStart={(e) => {
                            e.preventDefault();
                        }}
                        className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_STICKY_BUTTONS_CONTAINER)}
                    >
                        {stickyButtons}
                    </div>
                );
            }
        }

        if (!tabsetNode.isEnableTabWrap()) {
            if (isShowHiddenTabs) {
                const overflowTitle = controller.i18nName(I18nLabel.Overflow_Menu_Tooltip);
                let overflowContent;
                if (typeof icons.more === "function") {
                    const tabs = tabsetNode.getTabNodes();
                    const items = hiddenTabs.map((h) => {
                        return { index: h, node: tabs[h] };
                    });
                    overflowContent = icons.more(tabsetNode, items);
                } else {
                    overflowContent = (
                        <>
                            {icons.more}
                            <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_OVERFLOW_COUNT)}>{hiddenTabs.length > 0 ? hiddenTabs.length : ""}</div>
                        </>
                    );
                }
                buttons.splice(
                    Math.min(renderState.overflowPosition, buttons.length),
                    0,
                    // explicit tabindex: Safari skips native buttons in tab order
                    <button
                        key="overflowbutton"
                        tabIndex={0}
                        data-layout-path={path + "/button/overflow"}
                        aria-haspopup="menu"
                        aria-expanded={overflowMenuOpen}
                        aria-label={overflowTitle}
                        ref={overflowbuttonRef}
                        className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_OVERFLOW)}
                        title={overflowTitle}
                        onClick={onOverflowClick}
                        onPointerDown={onInterceptPointerDown}
                    >
                        {overflowContent}
                    </button>,
                );
            }
        }

        if (selectedTabNode !== undefined && !selectedTabNode.isPinned()) {
            if (selectedTabNode.isEnableFloat() && selectedTabNode.isEnableFloatIcon()) {
                const popoutFloatTitle = controller.i18nName(I18nLabel.Popout_Tab_Float);
                buttons.push(
                    <button
                        key="popout-float"
                        tabIndex={0}
                        data-layout-path={path + "/button/popout-float"}
                        title={popoutFloatTitle}
                        aria-label={popoutFloatTitle}
                        className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_FLOAT)}
                        onClick={onPopoutFloat}
                        onPointerDown={onInterceptPointerDown}
                    >
                        {typeof icons.popoutFloat === "function" ? icons.popoutFloat(selectedTabNode) : icons.popoutFloat}
                    </button>,
                );
            }

            if (controller.isSupportsPopout() && selectedTabNode.isAllowedInWindow() && selectedTabNode.isEnablePopoutIcon()) {
                const popoutTitle = controller.i18nName(I18nLabel.Popout_Tab);
                buttons.push(
                    <button
                        key="popout"
                        tabIndex={0}
                        data-layout-path={path + "/button/popout"}
                        title={popoutTitle}
                        aria-label={popoutTitle}
                        className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_FLOAT)}
                        onClick={onPopoutWindow}
                        onPointerDown={onInterceptPointerDown}
                    >
                        {typeof icons.popout === "function" ? icons.popout(selectedTabNode) : icons.popout}
                    </button>,
                );
            }
        }

        if (tabsetNode.canMaximize()) {
            const minTitle = controller.i18nName(I18nLabel.Restore);
            const maxTitle = controller.i18nName(I18nLabel.Maximize);
            buttons.push(
                <button
                    key="max"
                    tabIndex={0}
                    data-layout-path={path + "/button/max"}
                    title={tabsetNode.isMaximized() ? minTitle : maxTitle}
                    aria-label={tabsetNode.isMaximized() ? minTitle : maxTitle}
                    aria-pressed={tabsetNode.isMaximized()}
                    className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_ + (tabsetNode.isMaximized() ? "max" : "min"))}
                    onClick={onMaximizeToggle}
                    onPointerDown={onInterceptPointerDown}
                >
                    {tabsetNode.isMaximized()
                        ? typeof icons.restore === "function"
                            ? icons.restore(tabsetNode)
                            : icons.restore
                        : typeof icons.maximize === "function"
                          ? icons.maximize(tabsetNode)
                          : icons.maximize}
                </button>,
            );
        }

        if (!tabsetNode.isMaximized() && showClose) {
            const title = isTabStretch ? controller.i18nName(I18nLabel.Close_Tab) : controller.i18nName(I18nLabel.Close_Tabset);
            buttons.push(
                <button
                    key="close"
                    tabIndex={0}
                    data-layout-path={path + "/button/close"}
                    title={title}
                    aria-label={title}
                    className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_CLOSE)}
                    onClick={isTabStretch ? onCloseTab : onClose}
                    onPointerDown={onInterceptPointerDown}
                >
                    {typeof icons.closeTabset === "function" ? icons.closeTabset(tabsetNode) : icons.closeTabset}
                </button>,
            );
        }

        if (tabsetNode.isActive() && tabsetNode.isEnableActiveIcon()) {
            const title = controller.i18nName(I18nLabel.Active_Tabset);
            buttons.push(
                <div key="active" data-layout-path={path + "/button/active"} title={title} aria-hidden="true" className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_ICON)}>
                    {typeof icons.activeTabset === "function" ? icons.activeTabset(tabsetNode) : icons.activeTabset}
                </div>,
            );
        }

        const buttonbar = (
            <div
                key="buttonbar"
                ref={buttonBarRef}
                className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR)}
                onPointerDown={onInterceptPointerDown}
                onDragStart={(e) => {
                    e.preventDefault();
                }}
            >
                {buttons}
            </div>
        );

        return { leading, buttonbar, stickyBar };
    };

    const renderTabBar = (tabs: React.ReactNode[], leading: React.ReactNode, buttonbar: React.ReactNode, stickyBar: React.ReactNode) => {
        let tabStrip;

        // tabset cycling shortcuts on the tablist
        const keyMap = controller.getKeyMap();
        const tablistKeyshortcuts = [toAriaKeyShortcuts(keyMap.focusNextTabset), toAriaKeyShortcuts(keyMap.focusPreviousTabset)].filter(Boolean).join(" ") || undefined;

        // drop tablist role during rename
        const editingHere = controller.getEditingTab()?.getParent() === tabsetNode;
        const tablistRole = editingHere ? undefined : "tablist";

        let tabStripClasses = cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_OUTER);
        if (tabsetNode.getClassNameTabStrip() !== undefined) {
            tabStripClasses += " " + tabsetNode.getClassNameTabStrip();
        }
        tabStripClasses += " " + cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_OUTER_ + tabsetNode.getTabLocation());

        if (tabsetNode.isActive()) {
            tabStripClasses += " " + cm(CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        }

        if (tabsetNode.isMaximized()) {
            tabStripClasses += " " + cm(CLASSES.FLEXLAYOUT__TABSET_MAXIMIZED);
        }

        const isTabStretch = isSingleTabStretched;
        if (isTabStretch) {
            const tabNode = tabsetNode.getChildren()[0] as TabNode;
            if (tabNode.getTabSetClassName() !== undefined) {
                tabStripClasses += " " + tabNode.getTabSetClassName();
            }
        }

        let leadingContainer: React.ReactNode = undefined;
        if (leading) {
            leadingContainer = <div className={cm(CLASSES.FLEXLAYOUT__TABSET_LEADING)}>{leading}</div>;
        }

        if (tabsetNode.isEnableTabWrap()) {
            if (tabsetNode.isEnableTabStrip()) {
                tabStrip = (
                    <div
                        className={tabStripClasses}
                        style={{ flexWrap: "wrap", gap: "1px", marginTop: "2px" }}
                        ref={setTabStripRef}
                        data-layout-path={path + "/tabstrip"}
                        onPointerDown={onPointerDown}
                        onDoubleClick={onDoubleClick}
                        onContextMenu={onContextMenu}
                        onClick={onAuxMouseClick}
                        onAuxClick={onAuxMouseClick}
                        draggable={true}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                    >
                        {leadingContainer}
                        {/* display: contents so the tabs keep wrapping in the strip's flex flow;
                            the tablist element may only contain the tabs, not the toolbar buttons */}
                        <div
                            role={tablistRole}
                            aria-orientation={editingHere ? undefined : "horizontal"}
                            aria-label={editingHere ? undefined : tabsetNode.getName()}
                            aria-keyshortcuts={editingHere ? undefined : tablistKeyshortcuts}
                            style={{ display: "contents" }}
                        >
                            {tabs}
                        </div>
                        {stickyBar}
                        <div style={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>{buttonbar}</div>
                    </div>
                );
            }
        } else {
            if (tabsetNode.isEnableTabStrip()) {
                let miniScrollbar = undefined;
                if (tabsetNode.isEnableTabScrollbar()) {
                    miniScrollbar = <div ref={miniScrollRef} aria-hidden="true" className={cm(CLASSES.FLEXLAYOUT__MINI_SCROLLBAR)} onPointerDown={onScrollPointerDown} />;
                }
                tabStrip = (
                    <div
                        className={tabStripClasses}
                        ref={setTabStripRef}
                        data-layout-path={path + "/tabstrip"}
                        onPointerDown={onPointerDown}
                        onDoubleClick={onDoubleClick}
                        onContextMenu={onContextMenu}
                        onClick={onAuxMouseClick}
                        onAuxClick={onAuxMouseClick}
                        draggable={true}
                        onWheel={onMouseWheel}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                    >
                        {leadingContainer}
                        <div className={cm(CLASSES.FLEXLAYOUT__MINI_SCROLLBAR_CONTAINER)}>
                            <div
                                ref={tabStripInnerRef}
                                className={cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER) + " " + cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_ + tabsetNode.getTabLocation())}
                                style={{ overflowX: "auto", overflowY: "hidden" }}
                                onScroll={onScroll}
                            >
                                <div
                                    style={{ width: isTabStretch ? "100%" : "none" }}
                                    role={tablistRole}
                                    aria-orientation={editingHere ? undefined : "horizontal"}
                                    aria-label={editingHere ? undefined : tabsetNode.getName()}
                                    aria-keyshortcuts={editingHere ? undefined : tablistKeyshortcuts}
                                    className={
                                        cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER) + " " + cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER_ + tabsetNode.getTabLocation())
                                    }
                                >
                                    {tabs}
                                </div>
                                {stickyBar}
                            </div>
                            {miniScrollbar}
                        </div>
                        {buttonbar}
                    </div>
                );
            }
        }
        return tabStrip;
    };

    const renderContent = (tabStrip: React.ReactNode) => {
        let emptyTabset: React.ReactNode;
        if (tabsetNode.getTabNodes().length === 0) {
            const placeHolderCallback = controller.getTabSetPlaceHolderCallback();
            if (placeHolderCallback) {
                emptyTabset = placeHolderCallback(tabsetNode);
            }
        }

        let content = (
            <div ref={setContentRef} className={cm(CLASSES.FLEXLAYOUT__TABSET_CONTENT)}>
                {emptyTabset}
            </div>
        );

        if (tabsetNode.getTabLocation() === "top") {
            content = (
                <>
                    {tabStrip}
                    {content}
                </>
            );
        } else {
            content = (
                <>
                    {content}
                    {tabStrip}
                </>
            );
        }
        return content;
    };

    const tabs = renderTabs();
    const { leading, buttonbar, stickyBar } = renderButtons();
    const tabStrip = renderTabBar(tabs, leading, buttonbar, stickyBar);
    const content = renderContent(tabStrip);

    const style: React.CSSProperties = {
        ...getFlexStyle(tabsetNode),
        minWidth: tabsetNode.getMinWidth(),
        minHeight: tabsetNode.getMinHeight(),
        maxWidth: tabsetNode.getMaxWidth(),
        maxHeight: tabsetNode.getMaxHeight(),
    };

    if (tabsetNode.getModel().getMaximizedTabset(controller.getLayoutId()) !== undefined && !tabsetNode.isMaximized()) {
        style.display = "none";
    }

    // outer container for flex sizing; inner for border/padding/margin styling
    const tabset = (
        <div ref={setSelfRef} className={cm(CLASSES.FLEXLAYOUT__TABSET_CONTAINER)} style={style}>
            <div className={cm(CLASSES.FLEXLAYOUT__TABSET)} data-layout-path={path}>
                {content}
            </div>
        </div>
    );

    if (tabsetNode.isMaximized()) {
        if (controller.getMainElement()) {
            return createPortal(
                <div
                    style={{
                        position: "absolute",
                        display: "flex",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                    }}
                >
                    {tabset}
                </div>,
                controller.getMainElement()!,
            );
        } else {
            return tabset;
        }
    } else {
        return tabset;
    }
};

TabSet.displayName = "TabSet"; // name in react dev tools
