import React from "react";
import ReactDOM from "react-dom";
import Splitter from "./Splitter.js";
import Tab from "./Tab.js";
import TabSet from "./TabSet.js";
import DragDrop from "../DragDrop.js";
import Rect from "../Rect.js";
import Utils from "../Utils.js";
import TabNode from "../model/TabNode.js";

class Layout extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {rect:null, maximizeNode: null};

        // listen for model changes
        this.props.model.addListener(this);
		this.logLayout();
	}

    onLayoutChange(model)
    {
		this.logLayout();

		this.forceUpdate();
    }

	logLayout()
	{
		var params = Utils.getQueryParams();
		if (params["log"] == "true")
		{
			console.log(this.props.model.toString());
		}
	}

    componentDidMount()
    {
		this.resize();
		// need to re-render if size changed
		window.addEventListener("resize", function (event)
		{
			this.resize();
        }.bind(this));
    }

    componentWillReceiveProps(newProps)
    {
        this.resize();
    }

    resize()
    {
        var domRect = this.refs.self.getBoundingClientRect();
        var rect = new Rect(0, 0, domRect.width, domRect.height);
        this.setState({rect:rect});
    }

    renderChild(node, childComponents)
    {
        var drawChildren = node.getDrawChildren();
        for (var i = 0; i < drawChildren.length; i++)
        {
            var child = drawChildren[i];

            if (child.type == "splitter")
            {
                childComponents.push(<Splitter key={child.key} layout={this} node={child}></Splitter>);
            }
            else if (child.type == "tabset")
            {
                childComponents.push(<TabSet key={child.key} layout={this} node={child}></TabSet>);
                this.renderChild(child, childComponents);
            }
            else if (child.type == "tab")
            {
                var selectedTab = child.parent.children[child.parent.selected];
                if (selectedTab == null)
                {
                    debugger; // this should not happen!
                }
                childComponents.push(<Tab key={child.key} layout={this} node={child}
                                          selected={child == selectedTab}
                                          factory={this.props.factory}></Tab>);
				child.setVisible(child === selectedTab);
            }
            else // is row
            {
                this.renderChild(child, childComponents);
            }
        }
    }

    render()
    {
        var childComponents = [];

        if (this.state.rect != null)
        {
			this.props.model.layout(this.state.rect);
            this.renderChild(this.props.model.root, childComponents);
        }
        else
        {
            childComponents.push(<span key="loading">loading...</span>);
        }
        //childComponents.forEach(c => console.log(c.key));
        return <div ref="self" className="flexlayout__layout" >{childComponents}</div>;
    }

	addTabWhereClicked(component, name, onDrop)
	{
		this.fnNewNodeDropped = onDrop;
		this.newNode = new TabNode(this.props.model);
		this.newNode.component = component;
		this.newNode.name=name;
		this.dragStart(null, this.newNode, null, null);
	}

    dragStart(event, node, onClick, onDoubleClick)
    {
        if (this.state.maximizeNode != null)
        {
            DragDrop.instance.startDrag(event, null, null, null, null, onClick, onDoubleClick);
        }
        else
        {
            this.dragNode = node;
            DragDrop.instance.startDrag(event, this.onDragStart.bind(this), this.onDragMove.bind(this), this.onDragEnd.bind(this), null, onClick, onDoubleClick);
        }
    }

    onDragStart(event)
    {
        var rootdiv =  ReactDOM.findDOMNode(this);
        this.outlineDiv = document.createElement("div");
        this.outlineDiv.style.position = "absolute";
        this.outlineDiv.className = "flexlayout__outline_rect";
        rootdiv.appendChild(this.outlineDiv);

        // add edge indicators
        this.showEdges(rootdiv);

		if (this.dragNode.tabRect != null)
		{
			this.dragNode.tabRect.positionElement(this.outlineDiv);
		}
		this.firstMove = true;

        return true;
    }

    onDragMove(event)
    {
		if (this.firstMove === false)
		{
			this.outlineDiv.style.transition = "top .2s, left .2s, width .2s, height .2s";
		}
		this.firstMove = false;
        var clientRect = this.refs.self.getBoundingClientRect();
        var pos = {
            x: event.clientX - clientRect.left,
            y: event.clientY - clientRect.top
        };

        var root = this.props.model.root;
        var dropInfo = root.findDropTargetNode(this.dragNode, pos.x, pos.y);
        if (dropInfo)
        {
            this.dropInfo = dropInfo;
            this.outlineDiv.className = dropInfo.className;
            dropInfo.rect.positionElement(this.outlineDiv);
        }
    }

    onDragEnd(event)
    {
        var rootdiv = ReactDOM.findDOMNode(this);
        rootdiv.removeChild(this.outlineDiv);
        this.hideEdges(rootdiv);

        if (this.dropInfo)
        {
            this.dropInfo.node.drop(this.dropInfo, this.dragNode);

			if (this.newNode != null && this.fnNewNodeDropped != null)
			{
				this.fnNewNodeDropped(this.newNode)
				this.newNode = null;
			}
        }
    }

    showEdges(rootdiv)
    {
        var domRect = rootdiv.getBoundingClientRect();
        var size = 100;
        var length = size + "px";
        var radius = "50px";
        var width = "10px";

        this.edgeTopDiv = document.createElement("div");
        this.edgeTopDiv.className = "flexlayout__edge_rect";
        this.edgeTopDiv.style.top = "0px";
        this.edgeTopDiv.style.left = (domRect.width-size)/2 + "px";
        this.edgeTopDiv.style.width = length;
        this.edgeTopDiv.style.height = width;
        this.edgeTopDiv.style.borderBottomLeftRadius = radius;
        this.edgeTopDiv.style.borderBottomRightRadius = radius;

        this.edgeLeftDiv = document.createElement("div");
        this.edgeLeftDiv.className = "flexlayout__edge_rect";
        this.edgeLeftDiv.style.top = (domRect.height-size)/2 + "px";
        this.edgeLeftDiv.style.left = "0px";
        this.edgeLeftDiv.style.width = width;
        this.edgeLeftDiv.style.height = length;
        this.edgeLeftDiv.style.borderTopRightRadius = radius;
        this.edgeLeftDiv.style.borderBottomRightRadius = radius;

        this.edgeBottomDiv = document.createElement("div");
        this.edgeBottomDiv.className = "flexlayout__edge_rect";
        this.edgeBottomDiv.style.bottom = "0px";
        this.edgeBottomDiv.style.left = (domRect.width-size)/2 + "px";
        this.edgeBottomDiv.style.width = length;
        this.edgeBottomDiv.style.height = width;
        this.edgeBottomDiv.style.borderTopLeftRadius = radius;
        this.edgeBottomDiv.style.borderTopRightRadius = radius;

        this.edgeRightDiv = document.createElement("div");
        this.edgeRightDiv.className = "flexlayout__edge_rect";
        this.edgeRightDiv.style.top = (domRect.height-size)/2 + "px";
        this.edgeRightDiv.style.right = "0px";
        this.edgeRightDiv.style.width = width;
        this.edgeRightDiv.style.height = length;
        this.edgeRightDiv.style.borderTopLeftRadius = radius;
        this.edgeRightDiv.style.borderBottomLeftRadius = radius;

        rootdiv.appendChild(this.edgeTopDiv);
        rootdiv.appendChild(this.edgeLeftDiv);
        rootdiv.appendChild(this.edgeBottomDiv);
        rootdiv.appendChild(this.edgeRightDiv);

    }

    hideEdges(rootdiv)
    {
        rootdiv.removeChild(this.edgeTopDiv);
        rootdiv.removeChild(this.edgeLeftDiv);
        rootdiv.removeChild(this.edgeBottomDiv);
        rootdiv.removeChild(this.edgeRightDiv);
    }

    maximize(maximizeNode)
    {
        maximizeNode.maximized = !maximizeNode.maximized;
		maximizeNode.fireEvent("maximize", {maximized: maximizeNode.maximized});
		this.setState({maximizeNode:maximizeNode.maximized===true?maximizeNode:null});
    }
}

export default Layout;
