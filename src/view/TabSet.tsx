import * as React from "react";
import { I18nLabel } from "./I18nLabel";
import { Actions } from "../model/Actions";
import { TabNode } from "../model/TabNode";
import { TabSetNode } from "../model/TabSetNode";
import { showPopup } from "./PopupMenu";
import { ITabSetRenderValues } from "./layout/LayoutTypes";
import { LayoutController } from "./layout/LayoutInternal";
import { TabButton } from "./TabButton";
import { useTabOverflow } from "./TabOverflowHook";
import { Orientation } from "../model/Orientation";
import { CLASSES } from "./CSSClassNames";
import { isAuxMouseEvent } from "./Utils";
import { createPortal } from "react-dom";

/** @internal */
export interface ITabSetProps {
    controller: LayoutController;
    tabsetNode: TabSetNode;
}

/** @internal */
export const TabSet = (props: ITabSetProps) => {
    const { tabsetNode, controller } = props;

    const tabStripRef = React.useRef<HTMLDivElement>(null);
    const miniScrollRef = React.useRef<HTMLDivElement>(null);
    const tabStripInnerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const buttonBarRef = React.useRef<HTMLDivElement>(null);
    const overflowbuttonRef = React.useRef<HTMLButtonElement>(null);
    const stickyButtonsRef = React.useRef<HTMLDivElement>(null);
    // const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const icons = controller.getIcons();

    React.useLayoutEffect(() => {
        tabsetNode.setRect(controller.getBoundingClientRect(selfRef.current!));

        if (tabStripRef.current) {
            tabsetNode.setTabStripRect(controller.getBoundingClientRect(tabStripRef.current!));
        }

        const newContentRect = controller.getBoundingClientRect(contentRef.current!);
        if (!tabsetNode.getContentRect().equalsWhenRounded(newContentRect) && !isNaN(newContentRect.x)) {
            tabsetNode.setContentRect(newContentRect);
            controller.setReLayout(true);
        }
    });

    // this must be after the useEffect, so the node rect is already set (else window popin will not position tabs correctly)
    const { selfRef, userControlledPositionRef, onScroll, onScrollPointerDown, hiddenTabs, onMouseWheel, isDockStickyButtons, isShowHiddenTabs } =
        useTabOverflow(controller, tabsetNode, Orientation.HORZ, tabStripInnerRef, miniScrollRef,
            controller.getClassName(CLASSES.FLEXLAYOUT__TAB_BUTTON));

    const onOverflowClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const callback = controller.getShowOverflowMenu();
        const items = hiddenTabs.map(h => { return { index: h, node: (tabsetNode.getChildren()[h] as TabNode) }; });
        if (callback !== undefined) {
            callback(tabsetNode, event, items, onOverflowItemSelect);
        } else {
            const element = overflowbuttonRef.current!;
            showPopup(
                element,
                tabsetNode,
                items,
                onOverflowItemSelect,
                controller
            );
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

    const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
        if (!isAuxMouseEvent(event)) {
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
            //  controller.doAction(Actions.popoutTabset(selectedTabNode.getParent()!.getId(), "window"));
        }
        event.stopPropagation();
    };

    const onPopoutFloat = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (selectedTabNode !== undefined) {
            controller.doAction(Actions.popoutTab(selectedTabNode.getId(), "float"));
            //  controller.doAction(Actions.popoutTabset(selectedTabNode.getParent()!.getId(), "float"));
        }
        event.stopPropagation();
    };

    const onDoubleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (tabsetNode.canMaximize()) {
            controller.maximize(tabsetNode);
        }
    };

    // Start Render

    const cm = controller.getClassName;
    const selectedTabNode: TabNode = tabsetNode.getSelectedNode() as TabNode;
    const path = tabsetNode.getPath();


    const renderTabs = () => {
        const tabs = [];
        let lastOneSelected = false;
        if (tabsetNode.isEnableTabStrip()) {
            const isSingleTabStretched = tabsetNode.isEnableSingleTabStretch() && tabsetNode.getChildren().length === 1;
            for (let i = 0; i < tabsetNode.getChildren().length; i++) {
                const child = tabsetNode.getChildren()[i] as TabNode;
                const isSelected = tabsetNode.getSelected() === i;

                let cns = cm(CLASSES.FLEXLAYOUT__TABSET_TAB_SPACER);
                if (i !== 0) {
                    cns += " " + cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER);
                }
                if (!tabsetNode.isEnableTabWrap() && !isSingleTabStretched) {
                    if (isSelected) {
                        cns += " " + cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER_SELECTED_BEFORE);
                    } else if (lastOneSelected) {
                        cns += " " + cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER_SELECTED_AFTER);
                    }
                }

                // tab spacer
                tabs.push(
                    <div key={"divider" + i} className={cns}>
                        <div className={cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER_INNER)}></div>
                    </div>
                );

                tabs.push(
                    <TabButton
                        controller={controller}
                        tabNode={child}
                        path={path + "/tb" + i}
                        key={child.getId()}
                        selected={isSelected}
                    />);

                // last spacer
                if (i === tabsetNode.getChildren().length - 1) {
                    cns = cm(CLASSES.FLEXLAYOUT__TABSET_TAB_SPACER);
                    if (!tabsetNode.isEnableTabWrap() && !isSingleTabStretched && isSelected) {
                        cns += " " + cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER_SELECTED_AFTER);
                    }
                    tabs.push(
                        <div key={"divider" + (i + 1)} className={cns}>
                            <div className={cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER_INNER)}></div>
                        </div>
                    );
                }


                lastOneSelected = isSelected;
            }
        }
        return tabs;
    };

    const renderButtons = (tabs: React.ReactNode[]) => {
        let leading: React.ReactNode = undefined;
        let stickyButtons: React.ReactNode[] = [];
        let buttons: React.ReactNode[] = [];

        // allow customization of header contents and buttons
        const renderState: ITabSetRenderValues = { leading, stickyButtons, buttons, overflowPosition: undefined };
        controller.customizeTabSet(tabsetNode, renderState);
        leading = renderState.leading;
        stickyButtons = renderState.stickyButtons;
        buttons = renderState.buttons;

        const isTabStretch = tabsetNode.isEnableSingleTabStretch() && tabsetNode.getChildren().length === 1;
        let showClose = (isTabStretch && ((tabsetNode.getChildren()[0] as TabNode).isCloseable())) || tabsetNode.isCloseable();
        showClose = showClose && tabsetNode.isEnableCloseButton()


        if (renderState.overflowPosition === undefined) {
            renderState.overflowPosition = stickyButtons.length;
        }

        if (stickyButtons.length > 0) {
            if (!tabsetNode.isEnableTabWrap() && (isDockStickyButtons || isTabStretch)) {
                buttons = [...stickyButtons, ...buttons];
            } else {
                tabs.push(<div
                    ref={stickyButtonsRef}
                    key="sticky_buttons_container"
                    onPointerDown={onInterceptPointerDown}
                    onDragStart={(e) => { e.preventDefault() }}
                    className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_STICKY_BUTTONS_CONTAINER)}
                >
                    {stickyButtons}
                </div>);
            }
        }

        if (!tabsetNode.isEnableTabWrap()) {
            if (isShowHiddenTabs) {
                const overflowTitle = controller.i18nName(I18nLabel.Overflow_Menu_Tooltip);
                let overflowContent;
                if (typeof icons.more === "function") {
                    const items = hiddenTabs.map(h => { return { index: h, node: (tabsetNode.getChildren()[h] as TabNode) }; });
                    overflowContent = icons.more(tabsetNode, items);
                } else {
                    overflowContent = (<>
                        {icons.more}
                        <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_OVERFLOW_COUNT)}>{hiddenTabs.length > 0 ? hiddenTabs.length : ""}</div>
                    </>);
                }
                buttons.splice(Math.min(renderState.overflowPosition, buttons.length), 0,
                    <button
                        key="overflowbutton"
                        data-layout-path={path + "/button/overflow"}

                        ref={overflowbuttonRef}
                        className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_OVERFLOW)}
                        title={overflowTitle}
                        onClick={onOverflowClick}
                        onPointerDown={onInterceptPointerDown}
                    >
                        {overflowContent}
                    </button>
                );
            }
        }

        if (selectedTabNode !== undefined) {
            if (selectedTabNode.isEnablePopoutFloatIcon()) {
                const popoutFloatTitle = controller.i18nName(I18nLabel.Popout_Tab_Float);
                buttons.push(
                    <button
                        key="popout-float"
                        data-layout-path={path + "/button/popout-float"}
                        title={popoutFloatTitle}
                        className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_FLOAT)}
                        onClick={onPopoutFloat}
                        onPointerDown={onInterceptPointerDown}
                    >
                        {(typeof icons.popoutFloat === "function") ? icons.popoutFloat(selectedTabNode) : icons.popoutFloat}
                    </button>
                );
            }

            if (controller.isSupportsPopout() && selectedTabNode.isAllowedInWindow() && selectedTabNode.isEnablePopout()) {
                const popoutTitle = controller.i18nName(I18nLabel.Popout_Tab);
                buttons.push(
                    <button
                        key="popout"
                        data-layout-path={path + "/button/popout"}
                        title={popoutTitle}
                        className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_FLOAT)}
                        onClick={onPopoutWindow}
                        onPointerDown={onInterceptPointerDown}
                    >
                        {(typeof icons.popout === "function") ? icons.popout(selectedTabNode) : icons.popout}
                    </button>
                );
            }

        }

        if (tabsetNode.canMaximize()) {
            const minTitle = controller.i18nName(I18nLabel.Restore);
            const maxTitle = controller.i18nName(I18nLabel.Maximize);
            buttons.push(
                <button
                    key="max"
                    data-layout-path={path + "/button/max"}
                    title={tabsetNode.isMaximized() ? minTitle : maxTitle}
                    className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_ + (tabsetNode.isMaximized() ? "max" : "min"))}
                    onClick={onMaximizeToggle}
                    onPointerDown={onInterceptPointerDown}
                >
                    {tabsetNode.isMaximized() ?
                        (typeof icons.restore === "function") ? icons.restore(tabsetNode) : icons.restore :
                        (typeof icons.maximize === "function") ? icons.maximize(tabsetNode) : icons.maximize}
                </button>
            );
        }

        if (!tabsetNode.isMaximized() && showClose) {
            const title = isTabStretch ? controller.i18nName(I18nLabel.Close_Tab) : controller.i18nName(I18nLabel.Close_Tabset);
            buttons.push(
                <button
                    key="close"
                    data-layout-path={path + "/button/close"}
                    title={title}
                    className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_CLOSE)}
                    onClick={isTabStretch ? onCloseTab : onClose}
                    onPointerDown={onInterceptPointerDown}
                >
                    {(typeof icons.closeTabset === "function") ? icons.closeTabset(tabsetNode) : icons.closeTabset}
                </button>
            );
        }

        if (tabsetNode.isActive() && tabsetNode.isEnableActiveIcon()) {
            const title = controller.i18nName(I18nLabel.Active_Tabset);
            buttons.push(
                <div
                    key="active"
                    data-layout-path={path + "/button/active"}
                    title={title}
                    className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_ICON)}
                >
                    {(typeof icons.activeTabset === "function") ? icons.activeTabset(tabsetNode) : icons.activeTabset}
                </div>
            );
        }

        const buttonbar = (
            <div key="buttonbar" ref={buttonBarRef}
                className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR)}
                onPointerDown={onInterceptPointerDown}
                onDragStart={(e) => { e.preventDefault() }}
            >
                {buttons}
            </div>
        );

        return { leading, buttonbar };
    };

    const renderTabBar = (tabs: React.ReactNode[], leading: React.ReactNode, buttonbar: React.ReactNode) => {
        let tabStrip;

        let tabStripClasses = cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_OUTER);
        if (tabsetNode.getClassNameTabStrip() !== undefined) {
            tabStripClasses += " " + tabsetNode.getClassNameTabStrip();
        }
        tabStripClasses += " " + CLASSES.FLEXLAYOUT__TABSET_TABBAR_OUTER_ + tabsetNode.getTabLocation();

        if (tabsetNode.isActive()) {
            tabStripClasses += " " + cm(CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        }

        if (tabsetNode.isMaximized()) {
            tabStripClasses += " " + cm(CLASSES.FLEXLAYOUT__TABSET_MAXIMIZED);
        }

        const isTabStretch = tabsetNode.isEnableSingleTabStretch() && tabsetNode.getChildren().length === 1;
        if (isTabStretch) {
            const tabNode = tabsetNode.getChildren()[0] as TabNode;
            if (tabNode.getTabSetClassName() !== undefined) {
                tabStripClasses += " " + tabNode.getTabSetClassName();
            }
        }

        let leadingContainer: React.ReactNode = undefined;
        if (leading) {
            leadingContainer = (
                <div className={cm(CLASSES.FLEXLAYOUT__TABSET_LEADING)}>
                    {leading}
                </div>
            );
        }

        if (tabsetNode.isEnableTabWrap()) {
            if (tabsetNode.isEnableTabStrip()) {
                tabStrip = (
                    <div className={tabStripClasses}
                        style={{ flexWrap: "wrap", gap: "1px", marginTop: "2px" }}
                        ref={tabStripRef}
                        data-layout-path={path + "/tabstrip"}
                        onPointerDown={onPointerDown}
                        onDoubleClick={onDoubleClick}
                        onContextMenu={onContextMenu}
                        onClick={onAuxMouseClick}
                        onAuxClick={onAuxMouseClick}
                        draggable={true}
                        onDragStart={onDragStart}
                    >
                        {leadingContainer}
                        {tabs}
                        <div style={{ flexGrow: 1 }} />
                        {buttonbar}
                    </div>
                );
            }
        } else {
            if (tabsetNode.isEnableTabStrip()) {
                let miniScrollbar = undefined;
                if (tabsetNode.isEnableTabScrollbar()) {
                    miniScrollbar = (
                        <div ref={miniScrollRef}
                            className={cm(CLASSES.FLEXLAYOUT__MINI_SCROLLBAR)}
                            onPointerDown={onScrollPointerDown}
                        />
                    );
                }
                tabStrip = (
                    <div className={tabStripClasses}
                        ref={tabStripRef}
                        data-layout-path={path + "/tabstrip"}
                        onPointerDown={onPointerDown}
                        onDoubleClick={onDoubleClick}
                        onContextMenu={onContextMenu}
                        onClick={onAuxMouseClick}
                        onAuxClick={onAuxMouseClick}
                        draggable={true}
                        onWheel={onMouseWheel}
                        onDragStart={onDragStart}
                    >
                        {leadingContainer}
                        <div className={cm(CLASSES.FLEXLAYOUT__MINI_SCROLLBAR_CONTAINER)}>
                            <div ref={tabStripInnerRef}
                                className={cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER) + " " + cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_ + tabsetNode.getTabLocation())}
                                style={{ overflowX: 'auto', overflowY: "hidden" }}
                                onScroll={onScroll}
                            >
                                <div
                                    style={{ width: (isTabStretch ? "100%" : "none") }}
                                    className={cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER) + " " + cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER_ + tabsetNode.getTabLocation())}
                                >
                                    {tabs}
                                </div>
                            </div>
                            {miniScrollbar}
                        </div>
                        {buttonbar}
                    </div>
                );
            }
        }
        return tabStrip;
    }

    const renderContent = (tabStrip: React.ReactNode) => {
        let emptyTabset: React.ReactNode;
        if (tabsetNode.getChildren().length === 0) {
            const placeHolderCallback = controller.getTabSetPlaceHolderCallback();
            if (placeHolderCallback) {
                emptyTabset = placeHolderCallback(tabsetNode);
            }
        }

        let content = <div ref={contentRef} className={cm(CLASSES.FLEXLAYOUT__TABSET_CONTENT)}>
            {emptyTabset}
        </div>

        if (tabsetNode.getTabLocation() === "top") {
            content = <>{tabStrip}{content}</>;
        } else {
            content = <>{content}{tabStrip}</>;
        }
        return content;
    }

    const tabs = renderTabs();
    const { leading, buttonbar } = renderButtons(tabs);
    const tabStrip = renderTabBar(tabs, leading, buttonbar);
    const content = renderContent(tabStrip);

    const style: React.CSSProperties = {
        flexGrow: Math.max(1, tabsetNode.getWeight() * 1000),
        minWidth: tabsetNode.getMinWidth(),
        minHeight: tabsetNode.getMinHeight(),
        maxWidth: tabsetNode.getMaxWidth(),
        maxHeight: tabsetNode.getMaxHeight()
    };

    if (tabsetNode.getModel().getMaximizedTabset(controller.getLayoutId()) !== undefined && !tabsetNode.isMaximized()) {
        style.display = "none";
    }

    // note: tabset container is needed to allow flexbox to size without border/padding/margin
    // then inner tabset can have border/padding/margin for styling
    const tabset = (
        <div ref={selfRef}
            className={cm(CLASSES.FLEXLAYOUT__TABSET_CONTAINER)}
            style={style}
        >
            <div className={cm(CLASSES.FLEXLAYOUT__TABSET)}
                data-layout-path={path}
            >
                {content}
            </div>
        </div>
    );

    if (tabsetNode.isMaximized()) {
        if (controller.getMainElement()) {
            return createPortal(
                <div style={{
                    position: "absolute",
                    display: "flex",
                    top: 0, left: 0, bottom: 0, right: 0
                }}>
                    {tabset}
                </div>, controller.getMainElement()!);
        } else {
            return tabset;
        }
    } else {
        return tabset;
    }

};


