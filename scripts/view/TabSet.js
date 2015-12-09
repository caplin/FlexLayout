import React from "react";
import ReactDOM from "react-dom";
import Rect from "../Rect.js";
import PopupMenu from "../PopupMenu.js";

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
            for (var i = 0; i < node.children.length; i++)
            {
                var child = node.children[i];
                if (child.tabRect.getRight() > this.props.node.rect.getRight() - (20 + toolbarWidth))
                {
                    hideTabsAfter = Math.max(0, i - 1);
                    //console.log("tabs truncated to:" + hideTabsAfter);
					this.showOverflow = node.children.length>1;

					if (i == 0)
					{
						this.showToolbar = false;
						if (child.tabRect.getRight() > this.props.node.rect.getRight() - 20)
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
        var style = node.styleWithPosition();

        if (this.props.node.maximized)
        {
            style.zIndex = 100;
        }

        var tabs = [];
        var hiddenTabs = [];
        for (var i = 0; i < node.children.length; i++)
        {
            var isSelected = this.props.node.selected == i;
            var showTab = this.state.hideTabsAfter >= i;

            var child = node.children[i];

            if (this.state.hideTabsAfter == i && this.props.node.selected > this.state.hideTabsAfter)
            {
                hiddenTabs.push({name:child.name, node:child, index:i});
                child = node.children[this.props.node.selected];
                isSelected = true;
            }
            else if (!showTab && !isSelected)
            {
                hiddenTabs.push({name:child.name, node:child, index:i});
            }
            if (showTab)
            {
                tabs.push(<TabButton layout={this.props.layout}
                                     node={child}
                                     key={child.key}
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
							<button key="max" className={"flexlayout__tab_toolbar_button-" + (node.maximized===true?"max":"min")}
									onClick={this.onMax.bind(this)}></button>
						</div>;
        }
		if (this.showOverflow === true)
		{
			tabs.push(<button key="overflowbutton" ref="overflowbutton" className="flexlayout__tab_button_overflow"
							  onClick={this.onOverflowClick.bind(this, hiddenTabs)}
							  onMouseDown={this.onInterceptMouseDown.bind(this)}
						>{hiddenTabs.length}</button>);
		}

        return <div style={style} className="flexlayout__tabset">
            <div className="flexlayout__tab_header_outer" onMouseDown={this.onMouseDown.bind(this)}>
                <div ref="header" className="flexlayout__tab_header_inner">
                    {tabs}
                </div>
            </div>
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
        //console.log(item);
        this.props.node.setSelected(item.index);
    }

    onMouseDown(event)
    {
        this.props.layout.dragStart(event, this.props.node, null, this.onDoubleClick.bind(this));
    }

	onInterceptMouseDown(event)
	{
		event.stopPropagation();
	}

	onMax()
	{
		this.props.layout.maximize(this.props.node);
	}

    onDoubleClick()
    {
        this.props.layout.maximize(this.props.node);
    }
}

class TabButton extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {editing:false};
		this.onEndEdit = this.onEndEdit.bind(this);
	}

    onMouseDown(event)
    {
        this.props.layout.dragStart(event, this.props.node, this.onClick.bind(this), this.onDoubleClick.bind(this));
    }

    onClick(event)
    {
		var node = this.props.node;
        if (node.parent.selected != this.props.pos)
        {
            node.parent.setSelected(this.props.pos);
        }
    }

	onDoubleClick(event)
	{
		this.setState({editing:true});
		document.body.addEventListener("mousedown", this.onEndEdit);
	}

	onEndEdit(event)
	{
		if (event.target != this.refs.contents)
		{
			this.setState({editing:false});
			document.body.removeEventListener("mousedown", this.onEndEdit);
		}
	}

	onClose(event)
	{
		this.props.node.delete();
	}

	onCloseMouseDown(event)
	{
		event.stopPropagation();
	}

    componentDidMount()
    {
        this.updateRect();
    }

    componentDidUpdate()
	{
		this.updateRect();
		if (this.state.editing)
		{
			this.refs.contents.select();
		}
	}

    updateRect()
    {
        // record position of tab in node
		var clientRect = ReactDOM.findDOMNode(this.props.layout).getBoundingClientRect();
		var myRect = this.refs.self.getBoundingClientRect();
		var p = {
			x: myRect.left - clientRect.left,
			y: myRect.top - clientRect.top
		};

		this.contentWidth = this.refs.contents.getBoundingClientRect().width;
        this.props.node.tabRect = new Rect(p.x, p.y, this.refs.self.offsetWidth, this.refs.self.offsetHeight);
    }

	onTextBoxMouseDown(event)
	{
		//console.log("onTextBoxMouseDown");
		event.stopPropagation();
	}

	onTextBoxKeyPress(event)
	{
		//console.log(event, event.keyCode);
		if (event.keyCode == 27) // esc
		{
			this.setState({editing:false});
		}
		else if (event.keyCode == 13) // enter
		{
			this.props.node.name = event.target.value;
			this.setState({editing:false});
		}
	}

    render()
    {
        var classNames = "flexlayout__tab_button" ;

        if (this.props.selected)
        {
            classNames += " flexlayout__tab_button--selected";
        }
        else
        {
            classNames += " flexlayout__tab_button--unselected";
        }

		var content = <div ref="contents" className="flexlayout__tab_button_content">{this.props.node.name}</div>;
		if (this.state.editing)
		{
			var contentStyle = {width: this.contentWidth + "px"};
			content = <input style={contentStyle}
							 ref="contents"
							 className="flexlayout__tab_button_textbox"
							 type="text"
							 autoFocus
							 defaultValue={this.props.node.name}
							 onKeyDown={this.onTextBoxKeyPress.bind(this)}
							 onMouseDown={this.onTextBoxMouseDown.bind(this)}
					/>;
		}


        return <div ref="self"
                    style={{visibility:this.props.show?"visible":"hidden"}}
                    className={classNames}
                    onMouseDown={this.onMouseDown.bind(this)}>
             <div className={"flexlayout__tab_button_leading"}></div>
            {content}
            <div className={"flexlayout__tab_button_trailing"} onMouseDown={this.onCloseMouseDown.bind(this)} onClick={this.onClose.bind(this)}></div>
        </div>;
    }
}

export default TabSet;