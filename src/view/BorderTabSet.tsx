import * as React from "react";
import DockLocation from "../DockLocation";
import Border from "../model/BorderNode";
import TabNode from "../model/TabNode";
import {BorderButton} from "./BorderButton";
import {IIcons, ILayoutCallbacks} from "./Layout";
import {showPopup} from "../PopupMenu";
import Actions from "../model/Actions";
import {getModifiedNodeList} from "./TabSet";
import {I18nLabel} from "../I18nLabel";

/** @hidden @internal */
export interface IBorderTabSetProps {
    border: Border;
    layout: ILayoutCallbacks;
    iconFactory?: (node: TabNode) => React.ReactNode | undefined;
    titleFactory?: (node: TabNode) => React.ReactNode | undefined;
    icons?: IIcons;
}

const MAX_TABS: number = 999;

/** @hidden @internal */
export const BorderTabSet = (props: IBorderTabSetProps) => {
    const {border, layout, iconFactory, titleFactory, icons} = props;

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
            const node = border;
            if (node.getChildren().length > 0) {
                const lastChild = node.getChildren()[node.getChildren().length - 1] as TabNode;

                const isTabVisible = (i: number, child: TabNode, childEnd: number, borderEnd: number, toolbarSize: number) => {
                    if (childEnd > borderEnd - (25 + toolbarSize)) {
                        hideTabsAfter.current = Math.max(0, i - 1);
                        showOverflow.current = node.getChildren().length > 1;
                        if (i === 0) {
                            showToolbar.current = false;
                            if (childEnd > borderEnd - 25) {
                                showOverflow.current = false;
                            }
                        }
                        renderAllTabs.current = false;
                        setForceUpdateCount(forceUpdateCount + 1);
                        return false;
                    }
                    return true;
                };

                if (node.getLocation() === DockLocation.TOP
                    || node.getLocation() === DockLocation.BOTTOM) {
                    const toolbarSize = toolbarRef.current!.getBoundingClientRect().width;
                    const borderEnd = node.getTabHeaderRect()!.getRight();
                    if (lastChild.getTabRect()!.getRight() > borderEnd - toolbarSize) {
                        const modifiedChildren = getModifiedNodeList(
                            node.getChildren() as TabNode[],
                            node.getSelected());
                        for (let i = 0; i < modifiedChildren.length; i++) {
                            const childTabNode = modifiedChildren[i] as TabNode;
                            const childEnd = childTabNode.getTabRect()!.getRight();
                            if (!isTabVisible(i, childTabNode, childEnd, borderEnd, toolbarSize)) {
                                return;
                            }
                        }
                    }
                } else {
                    const toolbarSize = toolbarRef.current!.getBoundingClientRect().height;
                    const borderEnd = node.getTabHeaderRect()!.getBottom();
                    if (lastChild.getTabRect()!.getBottom() > borderEnd - toolbarSize) {
                        const modifiedChildren = getModifiedNodeList(
                            node.getChildren() as TabNode[],
                            node.getSelected());
                        for (let i = 0; i < modifiedChildren.length; i++) {
                            const childTabNode = modifiedChildren[i] as TabNode;
                            const childEnd = childTabNode.getTabRect()!.getBottom();
                            if (!isTabVisible(i, childTabNode, childEnd, borderEnd, toolbarSize)) {
                                return;
                            }
                        }
                    }
                }
            }
        } else {
            renderAllTabs.current = true;
        }
    };

    const onInterceptMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<HTMLButtonElement, MouseEvent> | React.TouchEvent<HTMLButtonElement>) => {
        event.stopPropagation();
    };

    const onOverflowClick = () => {
        const element = overflowbuttonRef.current!;
        showPopup(element, hiddenTabs, onOverflowItemSelect, layout.getClassName);
    };

    const onOverflowItemSelect = (item: { name: string, node: TabNode, index: number }) => {
        layout.doAction(Actions.selectTab(item.node.getId()));
    };

    const onFloatTab = () => {
        const selectedTabNode = border.getChildren()[border.getSelected()] as TabNode;
        if (selectedTabNode !== undefined) {
            layout.doAction(Actions.floatTab(selectedTabNode.getId()));
        }
    };

    if (renderAllTabs.current) {
        hideTabsAfter.current = MAX_TABS;
        showOverflow.current = false;
        showToolbar.current = true;
    }

    const cm = layout.getClassName;

    let style = border.getTabHeaderRect()!.styleWithPosition({});
    const tabs = [];
    const hiddenTabs: { name: string, node: TabNode, index: number }[] = [];

    const layoutTab = (i: number) => {
        let isSelected = border.getSelected() === i;
        const showTab = hideTabsAfter.current >= i;
        let child = border.getChildren()[i] as TabNode;

        if (hideTabsAfter.current === i && border.getSelected() > hideTabsAfter.current) {
            hiddenTabs.push({name: child.getName(), node: child, index: i});
            child = border.getChildren()[border.getSelected()] as TabNode;
            isSelected = true;
        } else if (!showTab && !isSelected) {
            hiddenTabs.push({name: child.getName(), node: child, index: i});
        }
        if (showTab) {
            tabs.push(<BorderButton layout={layout}
                                    border={border.getLocation().getName()}
                                    node={child}
                                    key={child.getId()}
                                    selected={isSelected}
                                    iconFactory={iconFactory}
                                    titleFactory={titleFactory}
                                    icons={icons}/>);
        }
    };

    if (border.getLocation() !== DockLocation.LEFT) {
        for (let i = 0; i < border.getChildren().length; i++) {
            layoutTab(i);
        }
    } else {
        for (let i = border.getChildren().length - 1; i >= 0; i--) {
            layoutTab(i);
        }
    }

    let borderClasses = cm("flexlayout__border_" + border.getLocation().getName());
    if (border.getClassName() !== undefined) {
        borderClasses += " " + border.getClassName();
    }

    // allow customization of tabset right/bottom buttons
    let buttons: any[] = [];
    const renderState = {headerContent: {}, buttons};
    layout.customizeTabSet(border, renderState);
    buttons = renderState.buttons;

    let toolbar;
    if (showToolbar.current === true) {
        const selectedIndex = border.getSelected();
        if (selectedIndex !== -1) {
            const selectedTabNode = border.getChildren()[selectedIndex] as TabNode;
            if (selectedTabNode !== undefined && layout.isSupportsPopout() && selectedTabNode.isEnableFloat() && !selectedTabNode.isFloating()) {
                const floatTitle = layout.i18nName(I18nLabel.Float_Tab);
                buttons.push(<button key="float"
                                     title={floatTitle}
                                     className={cm("flexlayout__tab_toolbar_button-float")}
                                     onClick={onFloatTab}/>);
            }
        }
        toolbar = <div
            key="toolbar"
            ref={toolbarRef}
            className={cm("flexlayout__border_toolbar_" + border.getLocation().getName())}>
            {buttons}
        </div>;
    }

    if (showOverflow.current === true && hiddenTabs.length > 0) {
        const overflowButton = (<button key="overflowbutton" ref={overflowbuttonRef}
                                        className={cm("flexlayout__border_button_overflow_" + border.getLocation().getName())}
                                        onTouchStart={onInterceptMouseDown}
                                        onClick={() => onOverflowClick()}
                                        onMouseDown={onInterceptMouseDown}
        >{hiddenTabs.length}</button>);
        tabs.push(overflowButton);
    }

    style = layout.styleFont(style);

    let innerStyle = {};
    if (border.getLocation() === DockLocation.LEFT) {
        innerStyle = {right: border.getBorderBarSize()-1}
    } else if (border.getLocation() === DockLocation.RIGHT) {
        innerStyle = {left: border.getBorderBarSize()-1}
    }

    return <div
        style={style}
        className={borderClasses}>
        <div style={innerStyle} className={cm("flexlayout__border_inner_" + border.getLocation().getName())}>
            {tabs}
        </div>
        {toolbar}
    </div>;
};

