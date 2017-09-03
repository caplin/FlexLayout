import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import Splitter from "./Splitter.js";
import Tab from "./Tab.js";
import TabSet from "./TabSet.js";
import BorderTabSet from "./BorderTabSet.js";
import DragDrop from "../DragDrop.js";
import Rect from "../Rect.js";
import DockLocation from "../DockLocation.js";
import TabNode from "../model/TabNode.js";
import TabSetNode from "../model/TabSetNode.js";
import SplitterNode from "../model/SplitterNode.js";
import Actions from "../model/Actions.js";
import Model from "../model/Model.js";

/**
 * A React component that hosts a multi-tabbed layout
 */
class Layout extends React.Component {

    /**
     * @private
     */
    constructor(props) {
        super(props);
        this.model = this.props.model;
        this.rect = new Rect(0, 0, 0, 0);
        this.model.setListener(this.onModelChange.bind(this));
        this.updateRect = this.updateRect.bind(this);
        this.tabIds = [];
    }

    onModelChange() {
        this.forceUpdate();
        if (this.props.onModelChange) {
            this.props.onModelChange(this.model)
        }
    }

    doAction(action) {
        if (this.props.onAction !== undefined) {
            this.props.onAction(action);
        }
        else {
            this.model.doAction(action);
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.model !== newProps.model) {
            if (this.model != null) {
                this.model.setListener(null); // stop listening to old model
            }
            this.model = newProps.model;
            this.model.setListener(this.onModelChange.bind(this));
            this.forceUpdate();
        }
    }

    componentDidMount() {
        this.updateRect();

        // need to re-render if size changes
        window.addEventListener("resize", this.updateRect);
    }

    componentDidUpdate() {
        this.updateRect();
        //console.log("Layout time: " + this.layoutTime + "ms Render time: " + (Date.now() - this.start) + "ms");

    }

    updateRect() {
        const domRect = this.refs.self.getBoundingClientRect();
        const rect = new Rect(0, 0, domRect.width, domRect.height);
        if (!rect.equals(this.rect)) {
            this.rect = rect;
            this.forceUpdate();
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateRect);
    }

    render() {
        this.start = Date.now();
        const borderComponents = [];
        const tabSetComponents = [];
        const tabComponents = {};
        const splitterComponents = [];

        this.centerRect = this.model._layout(this.rect);

        this.renderBorder(this.model.getBorderSet(), borderComponents, tabComponents, splitterComponents);
        this.renderChildren(this.model.getRoot(), tabSetComponents, tabComponents, splitterComponents);

        const nextTopIds = [];
        const nextTopIdsMap = {};

        // Keep any previous tabs in the same DOM order as before, removing any that have been deleted
        this.tabIds.forEach(t => {
            if (tabComponents[t]) {
                nextTopIds.push(t);
                nextTopIdsMap[t] = t;
            }
        });
        this.tabIds = nextTopIds;

        // Add tabs that have been added to the DOM
        Object.keys(tabComponents).forEach(t => {
            if (!nextTopIdsMap[t]) {
                this.tabIds.push(t);
            }
        });

        this.layoutTime = (Date.now() - this.start);

        return (
            <div ref="self" className="flexlayout__layout">
                {tabSetComponents}
                {this.tabIds.map(t => {
                    return tabComponents[t];
                })}
                {borderComponents}
                {splitterComponents}
            </div>
        );
    }

    renderBorder(borderSet, borderComponents, tabComponents, splitterComponents) {
        for (let i = 0; i < borderSet.getBorders().length; i++) {
            const border = borderSet.getBorders()[i];
            if (border.isShowing()) {
                borderComponents.push(<BorderTabSet key={"border_" + border.getLocation().getName()} border={border}
                                                    layout={this}/>);
                const drawChildren = border._getDrawChildren();
                for (let i = 0; i < drawChildren.length; i++) {
                    const child = drawChildren[i];

                    if (child.getType() === SplitterNode.TYPE) {
                        splitterComponents.push(<Splitter key={child.getId()} layout={this} node={child}></Splitter>);
                    }
                    else if (child.getType() === TabNode.TYPE) {
                        tabComponents[child.getId()] = <Tab
                            key={child.getId()}
                            layout={this}
                            node={child}
                            selected={i == border.getSelected()}
                            factory={this.props.factory}>
                        </Tab>;
                    }
                }
            }
        }
    }

    renderChildren(node, tabSetComponents, tabComponents, splitterComponents) {
        const drawChildren = node._getDrawChildren();

        for (let i = 0; i < drawChildren.length; i++) {
            const child = drawChildren[i];

            if (child.getType() === SplitterNode.TYPE) {
                splitterComponents.push(<Splitter key={child.getId()} layout={this} node={child}></Splitter>);
            }
            else if (child.getType() === TabSetNode.TYPE) {
                tabSetComponents.push(<TabSet key={child.getId()} layout={this} node={child}></TabSet>);
                this.renderChildren(child, tabSetComponents, tabComponents, splitterComponents);
            }
            else if (child.getType() === TabNode.TYPE) {
                const selectedTab = child.getParent().getChildren()[child.getParent().getSelected()];
                if (selectedTab == null) {
                    debugger; // this should not happen!
                }
                tabComponents[child.getId()] = <Tab
                    key={child.getId()}
                    layout={this}
                    node={child}
                    selected={child === selectedTab}
                    factory={this.props.factory}>
                </Tab>;
            }
            else {// is row
                this.renderChildren(child, tabSetComponents, tabComponents, splitterComponents);
            }
        }
    }

    /**
     * Adds a new tab to the given tabset
     * @param tabsetId the id of the tabset where the new tab will be added
     * @param json the json for the new tab node
     */
    addTabToTabSet(tabsetId, json) {
        const tabsetNode = this.model.getNodeById(tabsetId);
        if (tabsetNode != null) {
            this.doAction(Actions.addNode(json, tabsetId, DockLocation.CENTER, -1));
        }
    }

    /**
     * Adds a new tab to the active tabset (if there is one)
     * @param json the json for the new tab node
     */
    addTabToActiveTabSet(json) {
        const tabsetNode = this.model.getActiveTabset();
        if (tabsetNode != null) {
            this.doAction(Actions.addNode(json, tabsetNode.getId(), DockLocation.CENTER, -1));
        }
    }

    /**
     * Adds a new tab by dragging a labeled panel to the drop location, dragging starts immediatelly
     * @param dragText the text to show on the drag panel
     * @param json the json for the new tab node
     * @param onDrop a callback to call when the drag is complete
     */
    addTabWithDragAndDrop(dragText, json, onDrop) {
        this.fnNewNodeDropped = onDrop;
        this.newTabJson = json;
        this.dragStart(null, dragText, new TabNode(this.model, json), null, null);
    }

    /**
     * Adds a new tab by dragging a labeled panel to the drop location, dragging starts when you
     * mouse down on the panel
     *
     * @param dragText the text to show on the drag panel
     * @param json the json for the new tab node
     * @param onDrop a callback to call when the drag is complete
     */
    addTabWithDragAndDropIndirect(dragText, json, onDrop) {
        this.fnNewNodeDropped = onDrop;
        this.newTabJson = json;

        DragDrop.instance.addGlass(this.onCancelAdd.bind(this));

        this.dragDivText = dragText;
        this.dragDiv = document.createElement("div");
        this.dragDiv.className = "flexlayout__drag_rect";
        this.dragDiv.innerHTML = this.dragDivText;
        this.dragDiv.addEventListener("mousedown", this.onDragDivMouseDown.bind(this));
        this.dragDiv.addEventListener("touchstart", this.onDragDivMouseDown.bind(this));

        const r = new Rect(10, 10, 150, 50);
        r.centerInRect(this.rect);
        this.dragDiv.style.left = r.x + "px";
        this.dragDiv.style.top = r.y + "px";

        const rootdiv = ReactDOM.findDOMNode(this);
        rootdiv.appendChild(this.dragDiv);
    }

    onCancelAdd() {
        const rootdiv = ReactDOM.findDOMNode(this);
        rootdiv.removeChild(this.dragDiv);
        this.dragDiv = null;
        if (this.fnNewNodeDropped != null) {
            this.fnNewNodeDropped();
            this.fnNewNodeDropped = null;
        }
        DragDrop.instance.hideGlass();
    }

    onCancelDrag() {
        const rootdiv = ReactDOM.findDOMNode(this);

        try {
            rootdiv.removeChild(this.outlineDiv);
        } catch (e) {
        }

        try {
            rootdiv.removeChild(this.dragDiv);
        } catch (e) {
        }

        this.dragDiv = null;
        this.hideEdges(rootdiv);
        if (this.fnNewNodeDropped != null) {
            this.fnNewNodeDropped();
            this.fnNewNodeDropped = null;
        }
        DragDrop.instance.hideGlass();
    }

    onDragDivMouseDown(event) {
        event.preventDefault();
        this.dragStart(event, this.dragDivText, new TabNode(this.model, this.newTabJson), true, null, null);
    }

    dragStart(event, dragDivText, node, allowDrag, onClick, onDoubleClick) {
        if (this.model.getMaximizedTabset() != null || !allowDrag) {
            DragDrop.instance.startDrag(event, null, null, null, null, onClick, onDoubleClick);
        }
        else {
            this.dragNode = node;
            this.dragDivText = dragDivText;
            DragDrop.instance.startDrag(event, this.onDragStart.bind(this), this.onDragMove.bind(this), this.onDragEnd.bind(this), this.onCancelDrag.bind(this), onClick, onDoubleClick);
        }
    }

    onDragStart(event) {
        this.dropInfo = null;
        const rootdiv = ReactDOM.findDOMNode(this);
        this.outlineDiv = document.createElement("div");
        this.outlineDiv.className = "flexlayout__outline_rect";
        rootdiv.appendChild(this.outlineDiv);

        if (this.dragDiv == null) {
            this.dragDiv = document.createElement("div");
            this.dragDiv.className = "flexlayout__drag_rect";
            this.dragDiv.innerHTML = this.dragDivText;
            rootdiv.appendChild(this.dragDiv);
        }
        // add edge indicators
        this.showEdges(rootdiv);

        if (this.dragNode != null && this.dragNode.getType() === TabNode.TYPE && this.dragNode.getTabRect() != null) {
            this.dragNode.getTabRect().positionElement(this.outlineDiv);
        }
        this.firstMove = true;

        return true;
    }

    onDragMove(event) {
        if (this.firstMove === false) {
            this.outlineDiv.style.transition = "top .3s, left .3s, width .3s, height .3s";
        }
        this.firstMove = false;
        const clientRect = this.refs.self.getBoundingClientRect();
        const pos = {
            x: event.clientX - clientRect.left,
            y: event.clientY - clientRect.top
        };

        this.dragDiv.style.left = (pos.x - this.dragDiv.getBoundingClientRect().width / 2) + "px";
        this.dragDiv.style.top = pos.y + 5 + "px";

        const dropInfo = this.model._findDropTargetNode(this.dragNode, pos.x, pos.y);
        if (dropInfo) {
            this.dropInfo = dropInfo;
            this.outlineDiv.className = dropInfo.className;
            dropInfo.rect.positionElement(this.outlineDiv);
        }
    }

    onDragEnd(event) {
        const rootdiv = ReactDOM.findDOMNode(this);
        rootdiv.removeChild(this.outlineDiv);
        rootdiv.removeChild(this.dragDiv);
        this.dragDiv = null;
        this.hideEdges(rootdiv);
        DragDrop.instance.hideGlass();

        if (this.dropInfo) {
            if (this.newTabJson != null) {
                this.doAction(Actions.addNode(this.newTabJson, this.dropInfo.node.getId(), this.dropInfo.location, this.dropInfo.index));

                if (this.fnNewNodeDropped != null) {
                    this.fnNewNodeDropped();
                    this.fnNewNodeDropped = null;
                }
                this.newTabJson = null;
            }
            else if (this.dragNode != null) {
                this.doAction(Actions.moveNode(this.dragNode.getId(), this.dropInfo.node.getId(), this.dropInfo.location, this.dropInfo.index));
            }

        }
    }

    showEdges(rootdiv) {
        if (this.model.isEnableEdgeDock()) {
            const domRect = rootdiv.getBoundingClientRect();
            const r = this.centerRect;
            const size = 100;
            const length = size + "px";
            const radius = "50px";
            const width = "10px";

            this.edgeTopDiv = document.createElement("div");
            this.edgeTopDiv.className = "flexlayout__edge_rect";
            this.edgeTopDiv.style.top = r.y + "px";
            this.edgeTopDiv.style.left = r.x + (r.width - size) / 2 + "px";
            this.edgeTopDiv.style.width = length;
            this.edgeTopDiv.style.height = width;
            this.edgeTopDiv.style.borderBottomLeftRadius = radius;
            this.edgeTopDiv.style.borderBottomRightRadius = radius;

            this.edgeLeftDiv = document.createElement("div");
            this.edgeLeftDiv.className = "flexlayout__edge_rect";
            this.edgeLeftDiv.style.top = r.y + (r.height - size) / 2 + "px";
            this.edgeLeftDiv.style.left = r.x + "px";
            this.edgeLeftDiv.style.width = width;
            this.edgeLeftDiv.style.height = length;
            this.edgeLeftDiv.style.borderTopRightRadius = radius;
            this.edgeLeftDiv.style.borderBottomRightRadius = radius;

            this.edgeBottomDiv = document.createElement("div");
            this.edgeBottomDiv.className = "flexlayout__edge_rect";
            this.edgeBottomDiv.style.bottom = (domRect.height - r.getBottom()) + "px";
            this.edgeBottomDiv.style.left = r.x + (r.width - size) / 2 + "px";
            this.edgeBottomDiv.style.width = length;
            this.edgeBottomDiv.style.height = width;
            this.edgeBottomDiv.style.borderTopLeftRadius = radius;
            this.edgeBottomDiv.style.borderTopRightRadius = radius;

            this.edgeRightDiv = document.createElement("div");
            this.edgeRightDiv.className = "flexlayout__edge_rect";
            this.edgeRightDiv.style.top = r.y + (r.height - size) / 2 + "px";
            this.edgeRightDiv.style.right = (domRect.width - r.getRight()) + "px";
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

    hideEdges(rootdiv) {
        if (this.model.isEnableEdgeDock()) {
            try {
                rootdiv.removeChild(this.edgeTopDiv);
                rootdiv.removeChild(this.edgeLeftDiv);
                rootdiv.removeChild(this.edgeBottomDiv);
                rootdiv.removeChild(this.edgeRightDiv);
            }
            catch (e) {
            }
        }
    }

    maximize(tabsetNode) {
        this.doAction(Actions.maximizeToggle(tabsetNode.getId()));
    }

    customizeTab(tabNode, renderValues) {
        if (this.props.onRenderTab) {
            this.props.onRenderTab(tabNode, renderValues);
        }
    }

    customizeTabSet(tabSetNode, renderValues) {
        if (this.props.onRenderTabSet) {
            this.props.onRenderTabSet(tabSetNode, renderValues);
        }
    }
}

Layout.propTypes = {
    model: PropTypes.instanceOf(Model).isRequired,
    factory: PropTypes.func.isRequired,

    onAction: PropTypes.func,

    onRenderTab: PropTypes.func,
    onRenderTabSet: PropTypes.func,

    onModelChange: PropTypes.func
};

export default Layout;
