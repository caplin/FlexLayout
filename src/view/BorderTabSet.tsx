import * as React from "react";
import DockLocation from "../DockLocation";
import Border from "../model/BorderNode";
import TabNode from "../model/TabNode";
import {BorderButton} from "./BorderButton";
import Layout from "./Layout";
import PopupMenu from "../PopupMenu";
import Actions from "../model/Actions";
import {TabSet} from "./TabSet";

/** @hidden @internal */
export interface IBorderTabSetProps {
    border: Border;
    layout: Layout;
    iconFactory?: (node: TabNode) => React.ReactNode | undefined;
    titleFactory?: (node: TabNode) => React.ReactNode | undefined;
    closeIcon?: React.ReactNode;
}

const MAX_TABS: number = 999;

/** @hidden @internal */
export class BorderTabSet extends React.Component<IBorderTabSetProps, any> {
    toolbarRef: React.RefObject<HTMLDivElement>;
    overflowbuttonRef: React.RefObject<HTMLButtonElement>;

    hideTabsAfter: number;
    showOverflow: boolean;
    showToolbar: boolean;
    renderAllTabs: boolean;

    constructor(props: IBorderTabSetProps) {
        super(props);
        this.hideTabsAfter = MAX_TABS;
        this.showOverflow = false;
        this.showToolbar = true;
        this.renderAllTabs = true;

        this.toolbarRef = React.createRef<HTMLDivElement>();
        this.overflowbuttonRef = React.createRef<HTMLButtonElement>();
    }

    componentDidMount() {
        this.updateVisibleTabs();
    }

    shouldComponentUpdate() { 
        this.renderAllTabs = true; // since not the force update of a second render to adjust tabs
        return true;
    }

    componentDidUpdate() {
        this.updateVisibleTabs();
    }

    updateVisibleTabs() {
        if (this.renderAllTabs) {
            const node = this.props.border;
            if (node.getChildren().length > 0) {
                const lastChild = node.getChildren()[node.getChildren().length - 1] as TabNode;

                const isTabVisible = (i: number, child: TabNode, childEnd: number, borderEnd: number, toolbarSize: number) => {
                    if (childEnd > borderEnd - (20 + toolbarSize)) {
                        this.hideTabsAfter = Math.max(0, i - 1);
                        this.showOverflow = node.getChildren().length > 1;
                        if (i === 0) {
                            this.showToolbar = false;
                            if (childEnd > borderEnd - 20) {
                                this.showOverflow = false;
                            }
                        }
                        this.renderAllTabs = false;
                        this.forceUpdate(); // re-render to hide some tabs
                        return false;
                    }
                    return true;
                };

                if (node.getLocation() === DockLocation.TOP
                    || node.getLocation() === DockLocation.BOTTOM) {
                    const toolbarSize = this.toolbarRef.current!.getBoundingClientRect().width;
                    const borderEnd = node.getTabHeaderRect()!.getRight();
                    if (lastChild.getTabRect()!.getRight() > borderEnd - toolbarSize) {
                        const modifiedChildren = TabSet.getModifiedNodeList(
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
                    const toolbarSize = this.toolbarRef.current!.getBoundingClientRect().height;
                    const borderEnd = node.getTabHeaderRect()!.getBottom();
                    if (lastChild.getTabRect()!.getBottom() > borderEnd - toolbarSize) {
                        const modifiedChildren = TabSet.getModifiedNodeList(
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
            this.renderAllTabs = true;
        }
    }

    onInterceptMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<HTMLButtonElement, MouseEvent> | React.TouchEvent<HTMLButtonElement>) => {
        event.stopPropagation();
    };

    onOverflowClick = (hiddenTabs: Array<{ name: string, node: TabNode, index: number }>) => {
        const element = this.overflowbuttonRef.current!;
        PopupMenu.show(element, hiddenTabs, this.onOverflowItemSelect, this.props.layout.getClassName);
    };

    onOverflowItemSelect = (item: { name: string, node: TabNode, index: number }) => {
        this.props.layout.doAction(Actions.selectTab(item.node.getId()));
    };

    render() {
        if (this.renderAllTabs) {
            this.hideTabsAfter = MAX_TABS;
            this.showOverflow = false;
            this.showToolbar = true;
        }

        const cm = this.props.layout.getClassName;

        const border = this.props.border;
        const style = border.getTabHeaderRect()!.styleWithPosition({});
        const tabs = [];
        const hiddenTabs: Array<{ name: string, node: TabNode, index: number }> = [];

        const layoutTab = (i: number) => {
            let isSelected = border.getSelected() === i;
            const showTab = this.hideTabsAfter >= i;
            let child = border.getChildren()[i] as TabNode;

            if (this.hideTabsAfter === i && border.getSelected() > this.hideTabsAfter) {
                hiddenTabs.push({name: child.getName(), node: child, index: i});
                child = border.getChildren()[border.getSelected()] as TabNode;
                isSelected = true;
            } else if (!showTab && !isSelected) {
                hiddenTabs.push({name: child.getName(), node: child, index: i});
            }
            if (showTab) {
                tabs.push(<BorderButton layout={this.props.layout}
                                        border={border.getLocation().getName()}
                                        node={child}
                                        key={child.getId()}
                                        selected={isSelected}
                                        iconFactory={this.props.iconFactory}
                                        titleFactory={this.props.titleFactory}
                                        closeIcon={this.props.closeIcon}/>);
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
        if (this.props.border.getClassName() !== undefined) {
            borderClasses += " " + this.props.border.getClassName();
        }

        // allow customization of tabset right/bottom buttons
        let buttons: any[] = [];
        const renderState = {headerContent: {}, buttons};
        this.props.layout.customizeTabSet(border, renderState);
        buttons = renderState.buttons;

        let toolbar;
        if (this.showToolbar === true) {
            toolbar = <div
                key="toolbar"
                ref={this.toolbarRef}
                className={cm("flexlayout__border_toolbar_" + border.getLocation().getName())}>
                {buttons}
            </div>;
        }

        if (this.showOverflow === true && hiddenTabs.length > 0) {
            const overflowButton = (<button key="overflowbutton" ref={this.overflowbuttonRef}
                                            className={cm("flexlayout__border_button_overflow_" + border.getLocation().getName())}
                                            onTouchStart={this.onInterceptMouseDown}
                                            onClick={this.onOverflowClick.bind(this, hiddenTabs)}
                                            onMouseDown={this.onInterceptMouseDown}
            >{hiddenTabs.length}</button>);
            tabs.push(overflowButton);
        }

        return <div
            style={style}
            className={borderClasses}>
            <div className={cm("flexlayout__border_inner_" + border.getLocation().getName())}>
                {tabs}
            </div>
            {toolbar}
        </div>;
    }
}

