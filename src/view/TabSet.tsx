import * as React from "react";
import { I18nLabel } from "../I18nLabel";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import { showPopup } from "../PopupMenu";
import { IIcons, ILayoutCallbacks } from "./Layout";
import { TabButton } from "./TabButton";
import { useTabOverflow } from "./TabOverflowHook";
import Orientation from "../Orientation";
import { CLASSES } from "../Types";

/** @hidden @internal */
export interface ITabSetProps {
    layout: ILayoutCallbacks;
    node: TabSetNode;
    iconFactory?: (node: TabNode) => React.ReactNode | undefined;
    titleFactory?: (node: TabNode) => React.ReactNode | undefined;
    icons?: IIcons;
    editingTab?: TabNode;
}

/** @hidden @internal */
export const TabSet = (props: ITabSetProps) => {
    const { node, layout, iconFactory, titleFactory, icons } = props;

    const toolbarRef = React.useRef<HTMLDivElement | null>(null);
    const overflowbuttonRef = React.useRef<HTMLButtonElement | null>(null);
    const tabbarInnerRef = React.useRef<HTMLDivElement | null>(null);
    const stickyButtonsRef = React.useRef<HTMLDivElement | null>(null);

    const { selfRef, position, userControlledLeft, hiddenTabs, onMouseWheel, tabsTruncated } = useTabOverflow(node, Orientation.HORZ, toolbarRef, stickyButtonsRef);

    const onOverflowClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const element = overflowbuttonRef.current!;
        showPopup(layout.getRootDiv(), element, hiddenTabs, onOverflowItemSelect, layout.getClassName);
        event.stopPropagation();
    };

    const onOverflowItemSelect = (item: { node: TabNode; index: number }) => {
        layout.doAction(Actions.selectTab(item.node.getId()));
        userControlledLeft.current = false;
    };

    const onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
        
        if (!isAuxMouseEvent(event)) {
            let name = node.getName();
            if (name === undefined) {
                name = "";
            } else {
                name = ": " + name;
            }
            layout.doAction(Actions.setActiveTabset(node.getId()));
            if (!layout.getEditingTab()) {
                const message = layout.i18nName(I18nLabel.Move_Tabset, name);
                layout.dragStart(event, message, node, node.isEnableDrag(), (event2: Event) => undefined, onDoubleClick);
            }
        }
    };

    const onAuxMouseClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (isAuxMouseEvent(event)) {
            layout.auxMouseClick(node, event);
        }
    };

    const onContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        layout.showContextMenu(node, event);
    };

    const onInterceptMouseDown = (event: React.MouseEvent | React.TouchEvent) => {
        event.stopPropagation();
    };

    const onMaximizeToggle = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (node.canMaximize()) {
            layout.maximize(node);
        }
        event.stopPropagation();
    };

    const onClose = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        layout.doAction(Actions.deleteTabset(node.getId()));
        event.stopPropagation();
    };

    const onFloatTab = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (selectedTabNode !== undefined) {
            layout.doAction(Actions.floatTab(selectedTabNode.getId()));
        }
        event.stopPropagation();
    };

    const onDoubleClick = (event: Event) => {
        if (node.canMaximize()) {
            layout.maximize(node);
        }
    };

    // Start Render
    const cm = layout.getClassName;

    // tabbar inner can get shifted left via tab rename, this resets scrollleft to 0
    if (tabbarInnerRef.current !== null && tabbarInnerRef.current!.scrollLeft !== 0) {
        tabbarInnerRef.current.scrollLeft = 0;
    }

    const selectedTabNode: TabNode = node.getSelectedNode() as TabNode;
    let style = node._styleWithPosition();

    if (node.getModel().getMaximizedTabset() !== undefined && !node.isMaximized()) {
        style.display = "none";
    }

    const tabs = [];
    if (node.isEnableTabStrip()) {
        for (let i = 0; i < node.getChildren().length; i++) {
            const child = node.getChildren()[i] as TabNode;
            let isSelected = node.getSelected() === i;
            tabs.push(
                <TabButton
                    layout={layout}
                    node={child}
                    key={child.getId()}
                    selected={isSelected}
                    show={true}
                    height={node.getTabStripHeight()}
                    iconFactory={iconFactory}
                    titleFactory={titleFactory}
                    icons={icons}
                />
            );
        }
    }

    const showHeader = node.getName() !== undefined;
    let stickyButtons: React.ReactNode[] = [];
    let buttons: React.ReactNode[] = [];
    let headerButtons: React.ReactNode[] = [];

    // allow customization of header contents and buttons
    const renderState = { headerContent: node.getName(), stickyButtons, buttons, headerButtons };
    layout.customizeTabSet(node, renderState);
    const headerContent = renderState.headerContent;
    stickyButtons = renderState.stickyButtons;
    buttons = renderState.buttons;
    headerButtons = renderState.headerButtons;

    if (stickyButtons.length > 0) {
        if (tabsTruncated) {
            buttons = [...stickyButtons, ...buttons];
        } else {
            tabs.push(<div
                ref={stickyButtonsRef}
                key="sticky_buttons_container"
                onMouseDown={onInterceptMouseDown}
                onTouchStart={onInterceptMouseDown}
                onDragStart={(e) => { e.preventDefault() }}
                className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_STICKY_BUTTONS_CONTAINER)}
            >
                {stickyButtons}
            </div>);
        }
    }

    let toolbar;
    if (hiddenTabs.length > 0) {
        const overflowTitle = layout.i18nName(I18nLabel.Overflow_Menu_Tooltip);
        buttons.push(
            <button
                key="overflowbutton"
                ref={overflowbuttonRef}
                className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_OVERFLOW)}
                title={overflowTitle}
                onClick={onOverflowClick}
                onMouseDown={onInterceptMouseDown}
                onTouchStart={onInterceptMouseDown}
            >
                {icons?.more}
                {hiddenTabs.length}
            </button>
        );
    }

    if (selectedTabNode !== undefined && layout.isSupportsPopout() && selectedTabNode.isEnableFloat() && !selectedTabNode.isFloating()) {
        const floatTitle = layout.i18nName(I18nLabel.Float_Tab);
        buttons.push(
            <button
                key="float"
                title={floatTitle}
                className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_FLOAT)}
                onClick={onFloatTab}
                onMouseDown={onInterceptMouseDown}
                onTouchStart={onInterceptMouseDown}
            >
                {icons?.popout}
            </button>
        );
    }
    if (node.canMaximize()) {
        const minTitle = layout.i18nName(I18nLabel.Restore);
        const maxTitle = layout.i18nName(I18nLabel.Maximize);
        const btns = showHeader ? headerButtons : buttons;
        btns.push(
            <button
                key="max"
                title={node.isMaximized() ? minTitle : maxTitle}
                className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_ + (node.isMaximized() ? "max" : "min"))}
                onClick={onMaximizeToggle}
                onMouseDown={onInterceptMouseDown}
                onTouchStart={onInterceptMouseDown}
            >
                {node.isMaximized() ? icons?.restore : icons?.maximize}
            </button>
        );
    }

    if (!node.isMaximized() && node.isEnableClose()) {
        const title = layout.i18nName(I18nLabel.Close_Tabset);
        const btns = showHeader ? headerButtons : buttons;
        btns.push(
            <button
                key="close"
                title={title}
                className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_CLOSE)}
                onClick={onClose}
                onMouseDown={onInterceptMouseDown}
                onTouchStart={onInterceptMouseDown}
            >
                {icons?.closeTabset}
            </button>
        );
    }

    toolbar = (
        <div key="toolbar" ref={toolbarRef}
            className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR)}
            onMouseDown={onInterceptMouseDown}
            onTouchStart={onInterceptMouseDown}
            onDragStart={(e) => { e.preventDefault() }}
        >
            {buttons}
        </div>
    );

    let header;
    let tabStrip;

    let tabStripClasses = cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_OUTER);
    if (node.getClassNameTabStrip() !== undefined) {
        tabStripClasses += " " + node.getClassNameTabStrip();
    }
    tabStripClasses += " " + CLASSES.FLEXLAYOUT__TABSET_TABBAR_OUTER_ + node.getTabLocation();

    if (node.isActive() && !showHeader) {
        tabStripClasses += " " + cm(CLASSES.FLEXLAYOUT__TABSET_SELECTED);
    }

    if (node.isMaximized() && !showHeader) {
        tabStripClasses += " " + cm(CLASSES.FLEXLAYOUT__TABSET_MAXIMIZED);
    }

    if (showHeader) {

        const headerToolbar = (
            <div key="toolbar" ref={toolbarRef}
                className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR)}
                onMouseDown={onInterceptMouseDown}
                onTouchStart={onInterceptMouseDown}
                onDragStart={(e) => { e.preventDefault() }}
            >
                {headerButtons}
            </div>
        );

        let tabHeaderClasses = cm(CLASSES.FLEXLAYOUT__TABSET_HEADER);
        if (node.isActive()) {
            tabHeaderClasses += " " + cm(CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        }
        if (node.isMaximized()) {
            tabHeaderClasses += " " + cm(CLASSES.FLEXLAYOUT__TABSET_MAXIMIZED);
        }
        if (node.getClassNameHeader() !== undefined) {
            tabHeaderClasses += " " + node.getClassNameHeader();
        }

        header = (
            <div className={tabHeaderClasses} style={{ height: node.getHeaderHeight() + "px" }}
                onMouseDown={onMouseDown}
                onContextMenu={onContextMenu}
                onClick={onAuxMouseClick}
                onAuxClick={onAuxMouseClick}
                onTouchStart={onMouseDown}>
                <div className={cm(CLASSES.FLEXLAYOUT__TABSET_HEADER_CONTENT)}>{headerContent}</div>
                {headerToolbar}
            </div>
        );
    }

    const tabStripStyle: { [key: string]: string } = { height: node.getTabStripHeight() + "px" };
    if (node.getTabLocation() === "top") {
        const top = showHeader ? node.getHeaderHeight() + "px" : "0px";
        tabStripStyle["top"] = top;
    } else {
        tabStripStyle["bottom"] = "0px";
    }
    tabStrip = (
        <div className={tabStripClasses} style={tabStripStyle}
            onMouseDown={onMouseDown}
            onContextMenu={onContextMenu}
            onClick={onAuxMouseClick}
            onAuxClick={onAuxMouseClick}
            onTouchStart={onMouseDown}>
            <div ref={tabbarInnerRef} className={cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER) + " " + cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_ + node.getTabLocation())}>
                <div
                    style={{ left: position }}
                    className={cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER) + " " + cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER_ + node.getTabLocation())}
                >
                    {tabs}
                </div>
            </div>
            {toolbar}
        </div>
    );

    style = layout.styleFont(style);

    return (
        <div ref={selfRef} dir="ltr" style={style} className={cm(CLASSES.FLEXLAYOUT__TABSET)} onWheel={onMouseWheel}>
            {header}
            {tabStrip}
        </div>
    );
};

/** @hidden @internal */
export function isAuxMouseEvent(event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) {
    let auxEvent = false;
    if (event.nativeEvent instanceof MouseEvent) {
        if (event.nativeEvent.button !== 0 || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
            auxEvent = true; 
        }
    }
    return auxEvent;
}

