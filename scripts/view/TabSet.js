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
        if (this.recalcVisibleTabs)
        {
            var toolbarWidth= this.refs.toolbar.getBoundingClientRect().width;
            var hideTabsAfter = 999;
            var node = this.props.node;
            for (var i = 0; i < node.getChildren().length; i++)
            {
                var child = node.getChildren()[i];
                if (child.getTabRect().getRight() > this.props.node.getRect().getRight() - (20 + toolbarWidth))
                {
                    hideTabsAfter = Math.max(0, i - 1);
                    //console.log("tabs truncated to:" + hideTabsAfter);
					this.showOverflow = node.getChildren().length>1;

					if (i == 0)
					{
						this.showToolbar = false;
						if (child.getTabRect().getRight() > this.props.node.getRect().getRight() - 20)
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
        for (var i = 0; i < node.getChildren().length; i++)
        {
            var isSelected = this.props.node.getSelected() == i;
            var showTab = this.state.hideTabsAfter >= i;

            var child = node.getChildren()[i];

            if (this.state.hideTabsAfter == i && this.props.node.getSelected() > this.state.hideTabsAfter)
            {
                hiddenTabs.push({name:child.getName(), node:child, index:i});
                child = node.getChildren()[this.props.node.getSelected()];
                isSelected = true;
            }
            else if (!showTab && !isSelected)
            {
                hiddenTabs.push({name:child.getName(), node:child, index:i});
            }
            if (showTab)
            {
                tabs.push(<TabButton layout={this.props.layout}
                                     node={child}
                                     key={child.getKey()}
                                     selected={isSelected}
                                     show={showTab}
                                     pos={i}/>);
            }
        }

        //tabs.forEach(c => console.log(c.key));

        var toolbar = null;
        if (this.showToolbar === true)
        {
            toolbar = <div key="toolbar" ref="toolbar" className="flexlayout__tab_toolbar"
							onMouseDown={this.onInterceptMouseDown.bind(this)}>
							<button key="max" className={"flexlayout__tab_toolbar_button-" + (node.isMaximized()?"max":"min")}
									onClick={this.onMaximizeToggle.bind(this)}></button>
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
        var selectedTabsetClass = (this.props.node.getModel().getActiveTabset() === this.props.node)?" flexlayout__tabset-selected":"";
        if (showHeader)
        {
            var header = <div className={"flexlayout__tabset_header" + selectedTabsetClass}
                              onMouseDown={this.onMouseDown.bind(this)}
                              onTouchStart={this.onMouseDown.bind(this)}>
                            {node.getName()}
                        </div>
            var tabStrip = <div className="flexlayout__tab_header_outer"  style={{top:"20px"}} >
                <div ref="header" className="flexlayout__tab_header_inner">
                    {tabs}
                </div>
            </div>;
        }
        else
        {
            var tabStrip = <div className={"flexlayout__tab_header_outer" + selectedTabsetClass}  style={{top:"0px"}}
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
        this.props.layout.dragStart(event, "Move tabset" + name ,this.props.node, null, this.onDoubleClick.bind(this));
    }

	onInterceptMouseDown(event)
	{
		event.stopPropagation();
	}

	onMaximizeToggle()
	{
		this.props.layout.maximize(this.props.node);
	}

    onDoubleClick()
    {
        this.props.layout.maximize(this.props.node);
    }
}



export default TabSet;