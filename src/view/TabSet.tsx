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
}

/** @hidden @internal */
export const TabSet = (props: ITabSetProps) => {
    const { node, layout, iconFactory, titleFactory, icons } = props;

    const toolbarRef = React.useRef<HTMLDivElement | null>(null);
    const overflowbuttonRef = React.useRef<HTMLButtonElement | null>(null);

    const { selfRef, position, userControlledLeft, hiddenTabs, onMouseWheel } = useTabOverflow(node, Orientation.HORZ, toolbarRef);

    const onOverflowClick = () => {
        const element = overflowbuttonRef.current!;
        showPopup(layout.getRootDiv(), element, hiddenTabs, onOverflowItemSelect, layout.getClassName);
    };

    const onOverflowItemSelect = (item: { node: TabNode; index: number }) => {
        layout.doAction(Actions.selectTab(item.node.getId()));
        userControlledLeft.current = false;
    };

    const onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
        let name = node.getName();
        if (name === undefined) {
            name = "";
        } else {
            name = ": " + name;
        }
        layout.doAction(Actions.setActiveTabset(node.getId()));
        const message = layout.i18nName(I18nLabel.Move_Tabset, name);
        layout.dragStart(event, message, node, node.isEnableDrag(), (event2: Event) => undefined, onDoubleClick);
    };

    const onInterceptMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<HTMLButtonElement, MouseEvent> | React.TouchEvent<HTMLButtonElement>) => {
        event.stopPropagation();
    };

    const onMaximizeToggle = () => {
        if (node.canMaximize()) {
            layout.maximize(node);
        }
    };

    const onFloatTab = () => {
        if (selectedTabNode !== undefined) {
            layout.doAction(Actions.floatTab(selectedTabNode.getId()));
        }
    };

    const onDoubleClick = (event: Event) => {
        if (node.canMaximize()) {
            layout.maximize(node);
        }
    };

    // Start Render
    const cm = layout.getClassName;

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

    let buttons: any[] = [];

    // allow customization of header contents and buttons
    const renderState = { headerContent: node.getName(), buttons };
    layout.customizeTabSet(node, renderState);
    const headerContent = renderState.headerContent;
    buttons = renderState.buttons;

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
        buttons.push(
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

    toolbar = (
        <div key="toolbar" ref={toolbarRef} className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR)} onMouseDown={onInterceptMouseDown}>
            {buttons}
        </div>
    );

    const showHeader = node.getName() !== undefined;
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
            <div className={tabHeaderClasses} style={{ height: node.getHeaderHeight() + "px" }} onMouseDown={onMouseDown} onTouchStart={onMouseDown}>
                <div className={cm(CLASSES.FLEXLAYOUT__TABSET_HEADER_CONTENT)}>{headerContent}</div>
                {toolbar}
            </div>
        );
        const tabStripStyle: { [key: string]: string } = { height: node.getTabStripHeight() + "px" };
        if (node.getTabLocation() === "top") {
            tabStripStyle["top"] = node.getHeaderHeight() + "px";
        } else {
            tabStripStyle["bottom"] = "0px";
        }

        tabStrip = (
            <div className={tabStripClasses} style={tabStripStyle} onMouseDown={onMouseDown} onTouchStart={onMouseDown}>
                <div className={cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER) + " " + cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_ + node.getTabLocation())}>
                    <div
                        style={{ left: position }}
                        className={cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER) + " " + cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER_ + node.getTabLocation())}
                    >
                        {tabs}
                    </div>
                </div>
            </div>
        );
    } else {
        const tabStripStyle: { [key: string]: string } = { height: node.getTabStripHeight() + "px" };
        if (node.getTabLocation() === "top") {
            tabStripStyle["top"] = "0px";
        } else {
            tabStripStyle["bottom"] = "0px";
        }
        tabStrip = (
            <div className={tabStripClasses} style={tabStripStyle} onMouseDown={onMouseDown} onTouchStart={onMouseDown}>
                <div className={cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER) + " " + cm(CLASSES.FLEXLAYOUT__TABSET_TABBAR_INNER_ + node.getTabLocation())}>
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
    }
    style = layout.styleFont(style);

    return (
        <div ref={selfRef} style={style} className={cm(CLASSES.FLEXLAYOUT__TABSET)} onWheel={onMouseWheel}>
            {header}
            {tabStrip}
        </div>
    );
};
