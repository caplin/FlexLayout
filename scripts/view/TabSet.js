import React from "react";
import ReactDOM from "react-dom";
import Rect from "../Rect.js";
import PopupMenu from "../PopupMenu.js";
import Actions from "../model/Actions.js";
import TabButton from "./TabButton.js";

class TabSet extends React.Component
{
    constructor(props)
    {
        super(props);
        this.recalcVisibleTabs = true;
		this.showOverflow = false;
        this.showToolbar = true;
        this.state = {hideTabsAfter:999};
    }

    componentDidMount()
    {
        this.updateVisibleTabs();
    }

    componentDidUpdate()
    {
        this.updateVisibleTabs();
    }

    componentWillReceiveProps(nextProps)
    {
		this.showToolbar = true;
		this.showOverflow = false;
        this.recalcVisibleTabs = true;
        this.setState({hideTabsAfter: 999});
    }

    updateVisibleTabs()
    {
        var node = this.props.node;

        if (node.isEnableTabStrip() && this.recalcVisibleTabs)
        {
            var toolbarWidth= this.refs.toolbar.getBoundingClientRect().width;
            var hideTabsAfter = 999;
            for (var i = 0; i < node.getChildren().length; i++)
            {
                var child = node.getChildren()[i];
                if (child.getTabRect().getRight() > node.getRect().getRight() - (20 + toolbarWidth))
                {
                    hideTabsAfter = Math.max(0, i - 1);
                    //console.log("tabs truncated to:" + hideTabsAfter);
					this.showOverflow = node.getChildren().length>1;

					if (i == 0)
					{
						this.showToolbar = false;
						if (child.getTabRect().getRight() > node.getRect().getRight() - 20)
						{
							this.showOverflow = false;
						}
					}

                    break;
                }
            }
            if (this.state.hideTabsAfter != hideTabsAfter)
            {
               this.setState({hideTabsAfter: hideTabsAfter});
            }
            this.recalcVisibleTabs = false;
        }
    }

    render()
    {
        var node = this.props.node;
        var style = node._styleWithPosition();

        if (this.props.node.isMaximized())
        {
            style.zIndex = 100;
        }

        var tabs = [];
        var hiddenTabs = [];
        if (node.isEnableTabStrip())
        {
            for (var i = 0; i < node.getChildren().length; i++) {
                var isSelected = this.props.node.getSelected() == i;
                var showTab = this.state.hideTabsAfter >= i;

                var child = node.getChildren()[i];

                if (this.state.hideTabsAfter == i && this.props.node.getSelected() > this.state.hideTabsAfter)
                {
                    hiddenTabs.push({name: child.getName(), node: child, index: i});
                    child = node.getChildren()[this.props.node.getSelected()];
                    isSelected = true;
                }
                else if (!showTab && !isSelected)
                {
                    hiddenTabs.push({name: child.getName(), node: child, index: i});
                }
                if (showTab)
                {
                    tabs.push(<TabButton layout={this.props.layout}
                                         node={child}
                                         key={child.getKey()}
                                         selected={isSelected}
                                         show={showTab}
                                         height={node.getTabStripHeight()}
                                         pos={i}/>);
                }
            }
        }
        //tabs.forEach(c => console.log(c.key));

        var buttons = [];

        // allow customization of header contents and buttons
        var renderState = {headerContent:node.getName(), buttons:buttons};
        this.props.layout.customizeTabSet(this.props.node, renderState);
        var headerContent = renderState.headerContent;
        buttons = renderState.buttons;

        var toolbar = null;
        if (this.showToolbar === true)
        {
            if (this.props.node.isEnableMaximize())
            {
                buttons.push(<button key="max" className={"flexlayout__tab_toolbar_button-" + (node.isMaximized()?"max":"min")}
                                  onClick={this.onMaximizeToggle.bind(this)}></button>);
            }
            toolbar = <div key="toolbar" ref="toolbar" className="flexlayout__tab_toolbar"
							onMouseDown={this.onInterceptMouseDown.bind(this)}>
                            {buttons}
						</div>;
        }

		if (this.showOverflow === true)
		{
			tabs.push(<button key="overflowbutton" ref="overflowbutton" className="flexlayout__tab_button_overflow"
							  onClick={this.onOverflowClick.bind(this, hiddenTabs)}
							  onMouseDown={this.onInterceptMouseDown.bind(this)}
						>{hiddenTabs.length}</button>);
		}

        var showHeader = node.getName() != null;
        var header = null;
        var tabStrip = null;

        var tabStripClasses = "flexlayout__tab_header_outer";
        if (this.props.node.getClassNameTabStrip() != null)
        {
            tabStripClasses += " " + this.props.node.getClassNameTabStrip();
        }
        if (node.getModel().getActiveTabset() === node && !showHeader)
        {
            tabStripClasses += " flexlayout__tabset-selected"
        }


        if (showHeader)
        {
            var tabHeaderClasses = "flexlayout__tabset_header";
            if (node.getModel().getActiveTabset() === node)
            {
                tabHeaderClasses += " flexlayout__tabset-selected"
            }
            if (this.props.node.getClassNameHeader() != null)
            {
                tabHeaderClasses += " " + this.props.node.getClassNameHeader();
            }

            var header = <div className={tabHeaderClasses}
                              style={{height:node.getHeaderHeight()+ "px"}}
                              onMouseDown={this.onMouseDown.bind(this)}
                              onTouchStart={this.onMouseDown.bind(this)}>
                            {headerContent}
                        </div>
            var tabStrip = <div className={tabStripClasses}
                                style={{height:node.getTabStripHeight()+ "px", top:node.getHeaderHeight()+ "px"}} >
                <div ref="header" className="flexlayout__tab_header_inner">
                    {tabs}
                </div>
            </div>;
        }
        else
        {
            var tabStrip = <div className={tabStripClasses}  style={{top:"0px", height:node.getTabStripHeight()+ "px"}}
                                onMouseDown={this.onMouseDown.bind(this)}
                                onTouchStart={this.onMouseDown.bind(this)}>
                <div ref="header" className="flexlayout__tab_header_inner">
                    {tabs}
                </div>
            </div>;
        }

        return <div style={style} className="flexlayout__tabset">
            {header}
            {tabStrip}
            {toolbar}
        </div>;
    }

    onOverflowClick(hiddenTabs, event)
    {
        console.log("hidden tabs: " + hiddenTabs);
        var element = this.refs.overflowbutton;
        PopupMenu.show(element, hiddenTabs, this.onOverflowItemSelect.bind(this));
    }

    onOverflowItemSelect(item)
    {
        var node = this.props.node;
        this.props.layout.doAction(Actions.selectTab(node, item.index));
    }

    onMouseDown(event)
    {
        var name = this.props.node.getName();
        if (name == null)
        {
            name = "";
        }
        else
        {
            name = ": " + name;
        }
        this.props.node.getModel().doAction(Actions.setActiveTabset(this.props.node));
        this.props.layout.dragStart(event, "Move tabset" + name ,this.props.node, this.props.node.isEnableDrag(), null, this.onDoubleClick.bind(this));
    }

	onInterceptMouseDown(event)
	{
		event.stopPropagation();
	}

	onMaximizeToggle()
	{
        if (this.props.node.isEnableMaximize())
        {
            this.props.layout.maximize(this.props.node);
        }
	}

    onDoubleClick()
    {
        if (this.props.node.isEnableMaximize())
        {
            this.props.layout.maximize(this.props.node);
        }
    }
}



export default TabSet;