import React from "react";
import ReactDOM from "react-dom";
import Splitter from "./Splitter.js";
import Tab from "./Tab.js";
import TabSet from "./TabSet.js";
import DragDrop from "../DragDrop.js";
import Rect from "../Rect.js";
import Utils from "../Utils.js";
import TabNode from "../model/TabNode.js";
import TabSetNode from "../model/TabSetNode.js";
import SplitterNode from "../model/SplitterNode.js";
import Actions from "../model/Actions.js";
import Model from "../model/Model.js";

class Layout extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {maximizeNode: null};

        // listen for model changes
        this.props.model.addListener(this);
		this.logLayout();
	}

    doAction(action)
    {
        if (this.props.onAction) // if onAction prop defined then send actions to that
        {
            this.props.onAction(action);
        }
        else // otherwise directly send action to model
        {
            this.props.model.doAction(action);
        }
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
        this.doAction(Actions.setRect(rect));
    }

    renderChild(node, childComponents)
    {
        var drawChildren = node._getDrawChildren();
        for (var i = 0; i < drawChildren.length; i++)
        {
            var child = drawChildren[i];

            if (child.getType() === SplitterNode.TYPE)
            {
                childComponents.push(<Splitter key={child.getKey()} layout={this} node={child}></Splitter>);
            }
            else if (child.getType() === TabSetNode.TYPE)
            {
                childComponents.push(<TabSet key={child.getKey()} layout={this} node={child}></TabSet>);
                this.renderChild(child, childComponents);
            }
            else if (child.getType() === TabNode.TYPE)
            {
                var selectedTab = child.getParent().getChildren()[child.getParent().getSelected()];
                if (selectedTab == null)
                {
                    debugger; // this should not happen!
                }
                childComponents.push(<Tab key={child.getKey()} layout={this} node={child}
                                          selected={child == selectedTab}
                                          factory={this.props.factory}></Tab>);
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

        if (this.props.model.getRect() != null)
        {
            this.renderChild(this.props.model.getRoot(), childComponents);
        }
        else
        {
            childComponents.push(<span key="loading">loading...</span>);
        }
        //childComponents.forEach(c => console.log(c.key));
        return <div ref="self" className="flexlayout__layout" >{childComponents}</div>;
    }

    addTabToTabSet(tabsetId, json)
    {
        var tabsetNode = this.props.model.getNodeById(tabsetId);
        if (tabsetNode != null)
        {
            var newNode = TabNode._create(this.props.model, json);
            this.props.model.doAction(Actions.addTab(tabsetNode, newNode));
        }
    }

    addTabToActiveTabSet(json)
    {
        var tabsetNode = this.props.model.getActiveTabset();
        if (tabsetNode != null)
        {
            var newNode = TabNode._create(this.props.model, json);
            this.props.model.doAction(Actions.addTab(tabsetNode, newNode));
        }
    }

    addTabWithDragAndDrop(dragText, json, onDrop)
    {
        this.fnNewNodeDropped = onDrop;
        this.newNode = TabNode._create(this.props.model, json);
        this.dragStart(null, dragText, this.newNode, null, null);
    }

	addTabWithDragAndDropIndirect(dragText, json, onDrop)
	{
        this.fnNewNodeDropped = onDrop;
        this.newNode = TabNode._create(this.props.model, json);

        DragDrop.instance.addGlass(this.onCancelAdd.bind(this));

        this.dragDivText = dragText;
        this.dragDiv = document.createElement("div");
        this.dragDiv.className = "flexlayout__drag_rect";
        this.dragDiv.innerHTML = this.dragDivText;
        this.dragDiv.addEventListener("mousedown", this.onDragDivMouseDown.bind(this));
        this.dragDiv.addEventListener("touchstart", this.onDragDivMouseDown.bind(this));

        var r = new Rect(10,10,150,50);
        r.centerInRect(this.props.model.getRect());
        r.positionElement(this.dragDiv);

        var rootdiv =  ReactDOM.findDOMNode(this);
        rootdiv.appendChild(this.dragDiv);
    }

    onCancelAdd()
    {
        var rootdiv =  ReactDOM.findDOMNode(this);
        rootdiv.removeChild(this.dragDiv);
        this.dragDiv=null;
        if (this.fnNewNodeDropped != null)
        {
            this.fnNewNodeDropped(null)
            this.fnNewNodeDropped = null;
        }
        DragDrop.instance.hideGlass();
    }

    onCancelDrag()
    {
        var rootdiv = ReactDOM.findDOMNode(this);
        try {rootdiv.removeChild(this.outlineDiv);} catch(e){}
        try {rootdiv.removeChild(this.dragDiv);} catch(e){}
        this.dragDiv = null;
        this.hideEdges(rootdiv);
        if (this.fnNewNodeDropped != null)
        {
            this.fnNewNodeDropped(null)
            this.fnNewNodeDropped = null;
        }
        DragDrop.instance.hideGlass();
    }

    onDragDivMouseDown(event)
    {
        event.preventDefault();
        this.dragStart(event, this.dragDivText, this.newNode, true, null, null);
    }

    dragStart(event, dragDivText, node, allowDrag, onClick, onDoubleClick)
    {
        if (this.state.maximizeNode != null || !allowDrag)
        {
            DragDrop.instance.startDrag(event, null, null, null, null, onClick, onDoubleClick);
        }
        else
        {
            this.dragNode = node;
            this.dragDivText = dragDivText;
            DragDrop.instance.startDrag(event, this.onDragStart.bind(this), this.onDragMove.bind(this), this.onDragEnd.bind(this), this.onCancelDrag.bind(this), onClick, onDoubleClick);
        }
    }

    onDragStart(event)
    {
        var rootdiv =  ReactDOM.findDOMNode(this);
        this.outlineDiv = document.createElement("div");
        this.outlineDiv.className = "flexlayout__outline_rect";
        rootdiv.appendChild(this.outlineDiv);

        if (this.dragDiv == null)
        {
            this.dragDiv = document.createElement("div");
            this.dragDiv.className = "flexlayout__drag_rect";
            this.dragDiv.innerHTML = this.dragDivText;
            rootdiv.appendChild(this.dragDiv);
        }
        // add edge indicators
        this.showEdges(rootdiv);

		if (this.dragNode.getType() == TabNode.TYPE && this.dragNode.getTabRect() != null)
		{
			this.dragNode.getTabRect().positionElement(this.outlineDiv);
		}
		this.firstMove = true;

        return true;
    }

    onDragMove(event)
    {
		if (this.firstMove === false)
		{
			this.outlineDiv.style.transition = "top .3s, left .3s, width .3s, height .3s";
		}
		this.firstMove = false;
        var clientRect = this.refs.self.getBoundingClientRect();
        var pos = {
            x: event.clientX - clientRect.left,
            y: event.clientY - clientRect.top
        };

        this.dragDiv.style.left = (pos.x-75) + "px";
        this.dragDiv.style.top = pos.y + "px";

        var root = this.props.model.getRoot();
        var dropInfo = root._findDropTargetNode(this.dragNode, pos.x, pos.y);
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
        rootdiv.removeChild(this.dragDiv);
        this.dragDiv = null;
        this.hideEdges(rootdiv);
        DragDrop.instance.hideGlass();


        if (this.dropInfo)
        {
            this.doAction(Actions.moveNode(this.dragNode, this.dropInfo.node,this.dropInfo.location,this.dropInfo.index));

			if (this.newNode != null && this.fnNewNodeDropped != null)
			{
				this.fnNewNodeDropped(this.newNode)
				this.newNode = null;
                this.fnNewNodeDropped = null;
			}
        }
    }

    showEdges(rootdiv)
    {
        if ( this.props.model.isEnableEdgeDock())
        {
            var domRect = rootdiv.getBoundingClientRect();
            var size = 100;
            var length = size + "px";
            var radius = "50px";
            var width = "10px";

            this.edgeTopDiv = document.createElement("div");
            this.edgeTopDiv.className = "flexlayout__edge_rect";
            this.edgeTopDiv.style.top = "0px";
            this.edgeTopDiv.style.left = (domRect.width - size) / 2 + "px";
            this.edgeTopDiv.style.width = length;
            this.edgeTopDiv.style.height = width;
            this.edgeTopDiv.style.borderBottomLeftRadius = radius;
            this.edgeTopDiv.style.borderBottomRightRadius = radius;

            this.edgeLeftDiv = document.createElement("div");
            this.edgeLeftDiv.className = "flexlayout__edge_rect";
            this.edgeLeftDiv.style.top = (domRect.height - size) / 2 + "px";
            this.edgeLeftDiv.style.left = "0px";
            this.edgeLeftDiv.style.width = width;
            this.edgeLeftDiv.style.height = length;
            this.edgeLeftDiv.style.borderTopRightRadius = radius;
            this.edgeLeftDiv.style.borderBottomRightRadius = radius;

            this.edgeBottomDiv = document.createElement("div");
            this.edgeBottomDiv.className = "flexlayout__edge_rect";
            this.edgeBottomDiv.style.bottom = "0px";
            this.edgeBottomDiv.style.left = (domRect.width - size) / 2 + "px";
            this.edgeBottomDiv.style.width = length;
            this.edgeBottomDiv.style.height = width;
            this.edgeBottomDiv.style.borderTopLeftRadius = radius;
            this.edgeBottomDiv.style.borderTopRightRadius = radius;

            this.edgeRightDiv = document.createElement("div");
            this.edgeRightDiv.className = "flexlayout__edge_rect";
            this.edgeRightDiv.style.top = (domRect.height - size) / 2 + "px";
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
    }

    hideEdges(rootdiv)
    {
        if ( this.props.model.isEnableEdgeDock())
        {
            try
            {
                rootdiv.removeChild(this.edgeTopDiv);
                rootdiv.removeChild(this.edgeLeftDiv);
                rootdiv.removeChild(this.edgeBottomDiv);
                rootdiv.removeChild(this.edgeRightDiv);
            }
            catch (e)
            {
            }
        }
    }

    maximize(maximizeNode)
    {
        this.doAction(Actions.maximizeToggle(maximizeNode));
		this.setState({maximizeNode:maximizeNode.isMaximized()?maximizeNode:null});
    }

    customizeTab(tabNode, renderValues)
    {
        if (this.props.onRenderTab)
        {
            this.props.onRenderTab(tabNode, renderValues);
        }
    }

    customizeTabSet(tabSetNode, renderValues)
    {
        if (this.props.onRenderTabSet)
        {
            this.props.onRenderTabSet(tabSetNode, renderValues);
        }

    }
}

Layout.propTypes = { model: React.PropTypes.instanceOf(Model),
                     factory: React.PropTypes.func,
                     onRenderTab:  React.PropTypes.func,
                     onRenderTabSet:  React.PropTypes.func,
                     onAction: React.PropTypes.func};

export default Layout;
