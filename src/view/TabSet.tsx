import * as React from "react";
import {I18nLabel} from "../I18nLabel";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import {showPopup} from "../PopupMenu";
import {IIcons, ILayoutCallbacks} from "./Layout";
import {TabButton} from "./TabButton";

/** @hidden @internal */
export interface ITabSetProps {
    layout: ILayoutCallbacks;
    node: TabSetNode;
    iconFactory?: (node: TabNode) => React.ReactNode | undefined;
    titleFactory?: (node: TabNode) => React.ReactNode | undefined;
    icons?: IIcons;
}

/** @hidden @internal */
const MAX_TABS: number = 999;

/*
    Since selected tab is always shown, move it to first position when
    determining the number for tabs that can be shown
 */
/** @hidden @internal */
export function getModifiedNodeList(nodes: TabNode[], selectedIndex: number): TabNode[] {
    const modifiedChildren = [...nodes];
    if (selectedIndex !== -1 && selectedIndex !== 0) {
        const selected = nodes[selectedIndex];
        const selectedRect = selected.getTabRect()!;
        // move selected node to first position
        modifiedChildren.splice(selectedIndex, 1);
        modifiedChildren.unshift(selected);
        selected.getTabRect()!.x = (nodes[0] as TabNode).getTabRect()!.x;
        selected.getTabRect()!.y = (nodes[0] as TabNode).getTabRect()!.y; // for vertical border
        // adjust x,y of tabs 1-selectedindex to account for insersion of selected at 0
        for (let i = 1; i <= selectedIndex; i++) {
            const child = modifiedChildren[i];
            child.getTabRect()!.x += selectedRect.width;
            child.getTabRect()!.y += selectedRect.height; // for vertical border
        }
    }
    return modifiedChildren;
}

/** @hidden @internal */
export const TabSet = (props: ITabSetProps) => {
    const {node, layout, iconFactory, titleFactory, icons} = props;

    const toolbarRef = React.useRef<HTMLDivElement | null>(null);
    const overflowbuttonRef = React.useRef<HTMLButtonElement | null>(null);

    const hideTabsAfter = React.useRef<number>(MAX_TABS);
    const showOverflow = React.useRef<boolean>(false);
    const showToolbar = React.useRef<boolean>(true);
    const renderAllTabs = React.useRef<boolean>(true);

    const [forceUpdateCount, setForceUpdateCount] = React.useState<number>(0);

    React.useLayoutEffect(() => {
        updateVisibleTabs();
    });

    const updateVisibleTabs = () => {
        if (renderAllTabs.current) {
            if (node.isEnableTabStrip() && node.getChildren().length > 0) {
                const toolbarWidth = toolbarRef.current!.getBoundingClientRect().width;
                const lastChild = node.getChildren()[node.getChildren().length - 1] as TabNode;

                if (lastChild.getTabRect()!.getRight() > node.getRect().getRight() - toolbarWidth) {
                    const modifiedChildren = getModifiedNodeList(
                        node.getChildren() as TabNode[],
                        node.getSelected());

                    for (let i = 0; i < modifiedChildren.length; i++) {
                        const child = modifiedChildren[i] as TabNode;
                        if (child.getTabRect()!.getRight() > node.getRect().getRight() - (25 + toolbarWidth)) {
                            hideTabsAfter.current = Math.max(0, i - 1);
                            showOverflow.current = node.getChildren().length > 1;
                            if (i === 0) {
                                showToolbar.current = false;
                                if (child.getTabRect()!.getRight() > node.getRect().getRight() - 25) {
                                    showOverflow.current = false;
                                }
                            }
                            renderAllTabs.current = false;
                            setForceUpdateCount(forceUpdateCount + 1);
                            return;
                        }
                    }
                }
            }
        } else {
            renderAllTabs.current = true;
        }
    };


    const onOverflowClick = () => {
        // console.log("hidden tabs: " + hiddenTabs);
        const element = overflowbuttonRef.current!;
        showPopup(element, hiddenTabs, onOverflowItemSelect, layout.getClassName);
    };

    const onOverflowItemSelect = (item: { name: string, node: TabNode, index: number }) => {
        layout.doAction(Actions.selectTab(item.node.getId()));
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
        if (node.isEnableMaximize()) {
            layout.maximize(node);
        }
    };

    const onFloatTab = () => {
        if (selectedTabNode !== undefined) {
            layout.doAction(Actions.floatTab(selectedTabNode.getId()));
        }
    };

    const onDoubleClick = (event: Event) => {
        if (node.isEnableMaximize()) {
            layout.maximize(node);
        }
    };

    if (renderAllTabs.current) {
        hideTabsAfter.current = MAX_TABS;
        showOverflow.current = false;
        showToolbar.current = true;
    }

    const cm = layout.getClassName;

    const selectedTabNode: TabNode = node.getSelectedNode() as TabNode;
    let style = node._styleWithPosition();

    if (node.isMaximized()) {
        style.zIndex = 100;
    }

    const tabs = [];
    const hiddenTabs: { name: string, node: TabNode, index: number }[] = [];
    if (node.isEnableTabStrip()) {
        for (let i = 0; i < node.getChildren().length; i++) {
            let isSelected = node.getSelected() === i;
            const showTab = hideTabsAfter.current >= i;

            let child = node.getChildren()[i] as TabNode;

            if (hideTabsAfter.current === i && node.getSelected() > hideTabsAfter.current) {
                hiddenTabs.push({name: child.getName(), node: child, index: i});
                child = node.getChildren()[node.getSelected()] as TabNode;
                isSelected = true;
            } else if (!showTab && !isSelected) {
                hiddenTabs.push({name: child.getName(), node: child, index: i});
            }
            if (showTab) {
                tabs.push(<TabButton layout={layout}
                                     node={child}
                                     key={child.getId()}
                                     selected={isSelected}
                                     show={showTab}
                                     height={node.getTabStripHeight()}
                                     iconFactory={iconFactory}
                                     titleFactory={titleFactory}
                                     icons={icons}/>);
            }
        }
    }
    // tabs.forEach(c => console.log(c.key));

    let buttons: any[] = [];

    // allow customization of header contents and buttons
    const renderState = {headerContent: node.getName(), buttons};
    layout.customizeTabSet(node, renderState);
    const headerContent = renderState.headerContent;
    buttons = renderState.buttons;

    let toolbar;
    if (showToolbar.current === true) {
        if (selectedTabNode !== undefined && layout.isSupportsPopout() && selectedTabNode.isEnableFloat() && !selectedTabNode.isFloating()) {
            const floatTitle = layout.i18nName(I18nLabel.Float_Tab);
            buttons.push(<button key="float"
                                 title={floatTitle}
                                 className={
                                    cm("flexlayout__tab_toolbar_button") + " " + 
                                    cm("flexlayout__tab_toolbar_button-float")
                                }
                                 onClick={onFloatTab}
                                 onMouseDown={onInterceptMouseDown}
                                 onTouchStart={onInterceptMouseDown}
            >{icons?.popout}</button>);
        }
        if (node.isEnableMaximize()) {
            const minTitle = layout.i18nName(I18nLabel.Restore);
            const maxTitle = layout.i18nName(I18nLabel.Maximize);
            buttons.push(<button key="max"
                                 title={node.isMaximized() ? minTitle : maxTitle}
                                 className={
                                    cm("flexlayout__tab_toolbar_button") + " " + 
                                    cm("flexlayout__tab_toolbar_button-" + (node.isMaximized() ? "max" : "min"))
                                }
                                 onClick={onMaximizeToggle}
                                 onMouseDown={onInterceptMouseDown}
                                 onTouchStart={onInterceptMouseDown}
            >{node.isMaximized() ? icons?.restore : icons?.maximize}</button>);
        }

        toolbar = <div key="toolbar" ref={toolbarRef} className={cm("flexlayout__tab_toolbar")}
                       onMouseDown={onInterceptMouseDown}>
            {buttons}
        </div>;
    }

    if (showOverflow.current === true && hiddenTabs.length > 0) {
        tabs.push(<button key="overflowbutton" ref={overflowbuttonRef}
                          className={cm("flexlayout__tab_button_overflow")}
                          onClick={onOverflowClick}
                          onMouseDown={onInterceptMouseDown}
                          onTouchStart={onInterceptMouseDown}
        >{icons?.more}{hiddenTabs.length}</button>);
    }

    const showHeader = node.getName() !== undefined;
    let header;
    let tabStrip;

    let tabStripClasses = cm("flexlayout__tabset_header_outer");
    if (node.getClassNameTabStrip() !== undefined) {
        tabStripClasses += " " + node.getClassNameTabStrip();
    }
    tabStripClasses += " flexlayout__tabset_header_outer_"+ node.getTabLocation();

    if (node.isActive() && !showHeader) {
        tabStripClasses += " " + cm("flexlayout__tabset-selected");
    }

    if (node.isMaximized() && !showHeader) {
        tabStripClasses += " " + cm("flexlayout__tabset-maximized");
    }

    if (showHeader) {
        let tabHeaderClasses = cm("flexlayout__tabset_header");
        if (node.isActive()) {
            tabHeaderClasses += " " + cm("flexlayout__tabset-selected");
        }
        if (node.isMaximized()) {
            tabHeaderClasses += " " + cm("flexlayout__tabset-maximized");
        }
        if (node.getClassNameHeader() !== undefined) {
            tabHeaderClasses += " " + node.getClassNameHeader();
        }

        header = <div className={tabHeaderClasses}
                      style={{height: node.getHeaderHeight() + "px"}}
                      onMouseDown={onMouseDown}
                      onTouchStart={onMouseDown}>
            {headerContent}
            {toolbar}
        </div>;
        const tabStripStyle: {[key:string]: string} = {height: node.getTabStripHeight() + "px"};
        if (node.getTabLocation() === "top") {
            tabStripStyle["top"] = node.getHeaderHeight() + "px";
        } else {  
            tabStripStyle["bottom"] = "0px";
        }

        tabStrip = <div className={tabStripClasses}
                        style={tabStripStyle}>
            <div className={cm("flexlayout__tabset_header_inner_" + node.getTabLocation())}>
                {tabs}
            </div>
        </div>;
    } else {
        const tabStripStyle: {[key:string]: string} = {height: node.getTabStripHeight() + "px"};
        if (node.getTabLocation() === "top") {
            tabStripStyle["top"] = "0px";
        } else {
            tabStripStyle["bottom"] = "0px";
        }
        tabStrip = <div className={tabStripClasses} 
                        style={tabStripStyle}
                        onMouseDown={onMouseDown}
                        onTouchStart={onMouseDown}>
            <div className={cm("flexlayout__tabset_header_inner_" + node.getTabLocation())}>
                {tabs}
            </div>
            {toolbar}
        </div>;
    }
    style = layout.styleFont(style);

    return <div style={style} className={cm("flexlayout__tabset")}>
        {header}
        {tabStrip}
    </div>;
};
