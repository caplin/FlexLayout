import * as React from "react";
import { I18nLabel } from "../I18nLabel";
import { Actions } from "../model/Actions";
import { TabNode } from "../model/TabNode";
import { TabSetNode } from "../model/TabSetNode";
import { showPopup } from "../PopupMenu";
import { IIcons, ILayoutCallbacks, ITabSetRenderValues, ITitleObject } from "./Layout";
import { TabButton } from "./TabButton";
import { useTabOverflow } from "./TabOverflowHook";
import { Orientation } from "../Orientation";
import { CLASSES } from "../Types";
import { hideElement, isAuxMouseEvent } from "./Utils";

/** @internal */
export interface ITabSetProps {
    layout: ILayoutCallbacks;
    node: TabSetNode;
    iconFactory?: (node: TabNode) => (React.ReactNode | undefined);
    titleFactory?: (node: TabNode) => (ITitleObject | React.ReactNode | undefined);
    icons: IIcons;
    editingTab?: TabNode;
    path?: string;
}

/** @internal */
export const TabSet = (props: ITabSetProps) => {
    const { node, layout, iconFactory, titleFactory, icons, path } = props;

    const toolbarRef = React.useRef<HTMLDivElement | null>(null);
    const overflowbuttonRef = React.useRef<HTMLButtonElement | null>(null);
    const tabbarInnerRef = React.useRef<HTMLDivElement | null>(null);
    const stickyButtonsRef = React.useRef<HTMLDivElement | null>(null);

    const { selfRef, position, userControlledLeft, hiddenTabs, onMouseWheel, tabsTruncated } = useTabOverflow(node, Orientation.HORZ, toolbarRef, stickyButtonsRef);

    const onOverflowClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const callback = layout.getShowOverflowMenu();
        if (callback !== undefined) {
            callback(node, event, hiddenTabs, onOverflowItemSelect);
        } else {
            const element = overflowbuttonRef.current!;
            showPopup(
                element,
                hiddenTabs,
                onOverflowItemSelect,
                layout,
                iconFactory,
                titleFactory,
            );
        }
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
                if (node.getModel().getMaximizedTabset() !== undefined) {
                    layout.dragStart(event, message, node, false, (event2: Event) => undefined, onDoubleClick);
                } else {
                    layout.dragStart(event, message, node, node.isEnableDrag(), (event2: Event) => undefined, onDoubleClick);
                }
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

    const onCloseTab = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        layout.doAction(Actions.deleteTab(node.getChildren()[0].getId()));
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
        hideElement(style, node.getModel().isUseVisibility())
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
                    path={path + "/tb" + i}
                    key={child.getId()}
                    selected={isSelected}
                    iconFactory={iconFactory}
                    titleFactory={titleFactory}
                    icons={icons}
                />);
                if (i < node.getChildren().length-1) {
                    tabs.push(
                        <div  key={"divider" + i} className={cm(CLASSES.FLEXLAYOUT__TABSET_TAB_DIVIDER)}></div>
                    );
                }
        }
    }

    const showHeader = node.getName() !== undefined;
    let stickyButtons: React.ReactNode[] = [];
    let buttons: React.ReactNode[] = [];
    let headerButtons: React.ReactNode[] = [];

    // allow customization of header contents and buttons
    const renderState : ITabSetRenderValues = { headerContent: node.getName(), stickyButtons, buttons, headerButtons, overflowPosition: undefined };
    layout.customizeTabSet(node, renderState);
    const headerContent = renderState.headerContent;
    stickyButtons = renderState.stickyButtons;
    buttons = renderState.buttons;
    headerButtons = renderState.headerButtons;

    const isTabStretch = node.isEnableSingleTabStretch() && node.getChildren().length === 1;
    const showClose = (isTabStretch && ((node.getChildren()[0] as TabNode).isEnableClose())) || node.isEnableClose();

    if (renderState.overflowPosition === undefined) {
        renderState.overflowPosition = stickyButtons.length;
    }
    
    if (stickyButtons.length > 0) {
        if (tabsTruncated || isTabStretch) {
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
    
    if (hiddenTabs.length > 0) {
        const overflowTitle = layout.i18nName(I18nLabel.Overflow_Menu_Tooltip);
        let overflowContent;
        if (typeof icons.more === "function") {
            overflowContent = icons.more(node, hiddenTabs);
        } else {
            overflowContent = (<>
                {icons.more}
                <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_OVERFLOW_COUNT)}>{hiddenTabs.length}</div>
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
                onMouseDown={onInterceptMouseDown}
                onTouchStart={onInterceptMouseDown}
            >
                {overflowContent}
            </button>
        );
    }

    if (selectedTabNode !== undefined && layout.isSupportsPopout() && selectedTabNode.isEnableFloat() && !selectedTabNode.isFloating()) {
        const floatTitle = layout.i18nName(I18nLabel.Float_Tab);
        buttons.push(
            <button
                key="float"
                data-layout-path={path + "/button/float"}
                title={floatTitle}
                className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_FLOAT)}
                onClick={onFloatTab}
                onMouseDown={onInterceptMouseDown}
                onTouchStart={onInterceptMouseDown}
            >
                {(typeof icons.popout === "function") ? icons.popout(selectedTabNode) : icons.popout}
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
                data-layout-path={path + "/button/max"}
                title={node.isMaximized() ? minTitle : maxTitle}
                className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_ + (node.isMaximized() ? "max" : "min"))}
                onClick={onMaximizeToggle}
                onMouseDown={onInterceptMouseDown}
                onTouchStart={onInterceptMouseDown}
            >
                {node.isMaximized() ?
                    (typeof icons.restore === "function") ? icons.restore(node) : icons.restore :
                    (typeof icons.maximize === "function") ? icons.maximize(node) : icons.maximize}
            </button>
        );
    }

    if (!node.isMaximized() && showClose) {
        const title = isTabStretch ? layout.i18nName(I18nLabel.Close_Tab) : layout.i18nName(I18nLabel.Close_Tabset);
        const btns = showHeader ? headerButtons : buttons;
        btns.push(
            <button
                key="close"
                data-layout-path={path + "/button/close"}
                title={title}
                className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON_CLOSE)}
                onClick={isTabStretch ? onCloseTab : onClose}
                onMouseDown={onInterceptMouseDown}
                onTouchStart={onInterceptMouseDown}
            >
                {(typeof icons.closeTabset === "function") ? icons.closeTabset(node) : icons.closeTabset}
            </button>
        );
    }

    const toolbar = (
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

    if (isTabStretch) {
        const tabNode = node.getChildren()[0] as TabNode; 
        if (tabNode.getTabSetClassName() !== undefined) {
            tabStripClasses += " " + tabNode.getTabSetClassName();
        }
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
                data-layout-path={path + "/header"}
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
    tabStrip = (
        <div className={tabStripClasses} style={tabStripStyle}
            data-layout-path={path + "/tabstrip"}
            onMouseDown={onMouseDown}
            onContextMenu={onContextMenu}
            onClick={onAuxMouseClick}
            onAuxClick={onAuxMouseClick}
            onTouchStart={onMouseDown}>
            <div ref={tabbarInnerRef} className={cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER) + " " + cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_ + node.getTabLocation())}>
                <div
                    style={{ left: position, width: (isTabStretch? "100%": "10000px")}}
                    className={cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER) + " " + cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER_ + node.getTabLocation())}
                >
                    {tabs}
                </div>
            </div>
            {toolbar}
        </div>
    );

    style = layout.styleFont(style);

    var placeHolder: React.ReactNode = undefined;
    if (node.getChildren().length === 0) {
        const placeHolderCallback = layout.getTabSetPlaceHolderCallback();
        if (placeHolderCallback) {
            placeHolder = placeHolderCallback(node);
        }
    }

    const center = <div className={cm(CLASSES.FLEXLAYOUT__TABSET_CONTENT)}>
        {placeHolder}
    </div>

    var content;
    if (node.getTabLocation() === "top") {
        content = <>{header}{tabStrip}{center}</>;
    } else {
        content = <>{header}{center}{tabStrip}</>;
    }

    return (
        <div ref={selfRef}
            dir="ltr"
            data-layout-path={path}
            style={style}
            className={cm(CLASSES.FLEXLAYOUT__TABSET)}
            onWheel={onMouseWheel}>
            {content}
        </div>
    );
};


