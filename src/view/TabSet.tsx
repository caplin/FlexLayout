import * as React from "react";
import { I18nLabel } from "..";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import PopupMenu from "../PopupMenu";
import Layout from "./Layout";
import { TabButton } from "./TabButton";

/** @hidden @internal */
export interface ITabSetProps {
    layout: Layout;
    node: TabSetNode;
    iconFactory?: (node: TabNode) => React.ReactNode | undefined;
    titleFactory?: (node: TabNode) => React.ReactNode | undefined;
    closeIcon?: React.ReactNode;
}

const MAX_TABS: number = 999;

/** @hidden @internal */
export class TabSet extends React.Component<ITabSetProps, any> {
    toolbarRef: React.RefObject<HTMLDivElement>;
    overflowbuttonRef: React.RefObject<HTMLButtonElement>;

    hideTabsAfter: number;
    showOverflow: boolean;
    showToolbar: boolean;
    renderAllTabs: boolean;

    constructor(props: ITabSetProps) {
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

    componentDidUpdate() {
        this.updateVisibleTabs();
    }

    updateVisibleTabs() {
        const node = this.props.node;

        if (this.renderAllTabs) {
            if (node.isEnableTabStrip()) {
                const toolbarWidth = this.toolbarRef.current!.getBoundingClientRect().width;
                for (let i = 0; i < node.getChildren().length; i++) {
                    const child = node.getChildren()[i] as TabNode;
                    if (child.getTabRect()!.getRight() > node.getRect().getRight() - (20 + toolbarWidth)) {
                        this.hideTabsAfter = Math.max(0, i - 1);
                        this.showOverflow = node.getChildren().length > 1;
                        if (i === 0) {
                            this.showToolbar = false;
                            if (child.getTabRect()!.getRight() > node.getRect().getRight() - 20) {
                                this.showOverflow = false;
                            }
                        }
                        this.renderAllTabs = false;
                        this.forceUpdate(); // re-render to hide some tabs
                        return;
                    }
                }
            }
        } else {
            this.renderAllTabs = true;
        }
    }

    render() {
        if (this.renderAllTabs) {
            this.hideTabsAfter = MAX_TABS;
            this.showOverflow = false;
            this.showToolbar = true;
        }

        const cm = this.props.layout.getClassName;

        const node = this.props.node;
        const style = node._styleWithPosition();

        if (this.props.node.isMaximized()) {
            style.zIndex = 100;
        }

        const tabs = [];
        const hiddenTabs: Array<{ name: string, node: TabNode, index: number }> = [];
        if (node.isEnableTabStrip()) {
            for (let i = 0; i < node.getChildren().length; i++) {
                let isSelected = this.props.node.getSelected() === i;
                const showTab = this.hideTabsAfter >= i;

                let child = node.getChildren()[i] as TabNode;

                if (this.hideTabsAfter === i && this.props.node.getSelected() > this.hideTabsAfter) {
                    hiddenTabs.push({ name: child.getName(), node: child, index: i });
                    child = node.getChildren()[this.props.node.getSelected()] as TabNode;
                    isSelected = true;
                }
                else if (!showTab && !isSelected) {
                    hiddenTabs.push({ name: child.getName(), node: child, index: i });
                }
                if (showTab) {
                    tabs.push(<TabButton layout={this.props.layout}
                        node={child}
                        key={child.getId()}
                        selected={isSelected}
                        show={showTab}
                        height={node.getTabStripHeight()}
                        iconFactory={this.props.iconFactory}
                        titleFactory={this.props.titleFactory}
                        closeIcon={this.props.closeIcon} />);
                }
            }
        }
        // tabs.forEach(c => console.log(c.key));

        let buttons: any[] = [];

        // allow customization of header contents and buttons
        const renderState = { headerContent: node.getName(), buttons };
        this.props.layout.customizeTabSet(this.props.node, renderState);
        const headerContent = renderState.headerContent;
        buttons = renderState.buttons;

        let toolbar;
        if (this.showToolbar === true) {
            if (this.props.node.isEnableMaximize()) {
                buttons.push(<button key="max"
                    aria-label={node.isMaximized() ? "Minimize" : "Maximize"}
                    className={cm("flexlayout__tab_toolbar_button-" + (node.isMaximized() ? "max" : "min"))}
                    onClick={this.onMaximizeToggle}/>);
            }
            toolbar = <div key="toolbar" ref={this.toolbarRef} className={cm("flexlayout__tab_toolbar")}
                onMouseDown={this.onInterceptMouseDown}>
                {buttons}
            </div>;
        }

        if (this.showOverflow === true) {
            tabs.push(<button key="overflowbutton" ref={this.overflowbuttonRef} className={cm("flexlayout__tab_button_overflow")}
                onTouchStart={this.onInterceptMouseDown}
                onClick={this.onOverflowClick.bind(this, hiddenTabs)}
                onMouseDown={this.onInterceptMouseDown}
            >{hiddenTabs.length}</button>);
        }

        const showHeader = node.getName() !== undefined;
        let header;
        let tabStrip;

        let tabStripClasses = cm("flexlayout__tab_header_outer");
        if (this.props.node.getClassNameTabStrip() !== undefined) {
            tabStripClasses += " " + this.props.node.getClassNameTabStrip();
        }
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
            if (this.props.node.getClassNameHeader() !== undefined) {
                tabHeaderClasses += " " + this.props.node.getClassNameHeader();
            }

            header = <div className={tabHeaderClasses}
                style={{ height: node.getHeaderHeight() + "px" }}
                onMouseDown={this.onMouseDown}
                onTouchStart={this.onMouseDown}>
                {headerContent}
                {toolbar}
            </div>;
            tabStrip = <div className={tabStripClasses}
                style={{ height: node.getTabStripHeight() + "px", top: node.getHeaderHeight() + "px" }}>
                <div className={cm("flexlayout__tab_header_inner")}>
                    {tabs}
                </div>
            </div>;
        }
        else {
            tabStrip = <div className={tabStripClasses} style={{ top: "0px", height: node.getTabStripHeight() + "px" }}
                onMouseDown={this.onMouseDown}
                onTouchStart={this.onMouseDown}>
                <div className={cm("flexlayout__tab_header_inner")}>
                    {tabs}
                </div>
                {toolbar}
            </div>;
        }

        return <div style={style} className={cm("flexlayout__tabset")}>
            {header}
            {tabStrip}
        </div>;
    }

    onOverflowClick = (hiddenTabs: Array<{ name: string, node: TabNode, index: number }>) => {
        // console.log("hidden tabs: " + hiddenTabs);
        const element = this.overflowbuttonRef.current!;
        PopupMenu.show(element, hiddenTabs, this.onOverflowItemSelect, this.props.layout.getClassName);
    }

    onOverflowItemSelect = (item: { name: string, node: TabNode, index: number }) => {
        this.props.layout.doAction(Actions.selectTab(item.node.getId()));
    }

    onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
        let name = this.props.node.getName();
        if (name === undefined) {
            name = "";
        }
        else {
            name = ": " + name;
        }
        this.props.layout.doAction(Actions.setActiveTabset(this.props.node.getId()));
        const message = this.props.layout.i18nName(I18nLabel.Move_Tabset, name);
        this.props.layout.dragStart(event, message, this.props.node, this.props.node.isEnableDrag(), (event2: Event) => undefined, this.onDoubleClick);
    }
    
    onInterceptMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<HTMLButtonElement, MouseEvent> | React.TouchEvent<HTMLButtonElement>) => {
        event.stopPropagation();
    }

    onMaximizeToggle = () => {
        if (this.props.node.isEnableMaximize()) {
            this.props.layout.maximize(this.props.node);
        }
    }

    onDoubleClick = (event: Event) => {
        if (this.props.node.isEnableMaximize()) {
            this.props.layout.maximize(this.props.node);
        }
    }
}


// export default TabSet;
