import * as React from "react";
import * as ReactDOM from "react-dom";
import { Splitter, ISplitterProps } from "./Splitter";
import { Tab, ITabProps } from "./Tab";
import { TabSet, ITabSetProps } from "./TabSet";
import { BorderTabSet, IBorderTabSetProps } from "./BorderTabSet";
import DragDrop from "../DragDrop";
import Rect from "../Rect";
import DockLocation from "../DockLocation";
import Node from "../model/Node";
import RowNode from "../model/RowNode";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import BorderNode from "../model/BorderNode";
import SplitterNode from "../model/SplitterNode";
import Actions from "../model/Actions";
import Action from "../model/Action";
import Model from "../model/Model";
import BorderSet from "../model/BorderSet";
import { JSMap } from "../Types";
import IDraggable from "../model/IDraggable";

export interface ILayoutProps {
    model: Model,
    factory: (node: Node) => React.ReactNode,
    onAction?: (action: Action) => void,
    onRenderTab?: (node: TabNode, renderValues: { leading: React.ReactNode, content: React.ReactNode }) => void,
    onRenderTabSet?: (tabSetNode: (TabSetNode | BorderNode), renderValues: { headerContent?: React.ReactNode, buttons: Array<React.ReactNode> }) => void,
    onModelChange?: (model: Model) => void
}

/**
 * A React component that hosts a multi-tabbed layout
 */
export class Layout extends React.Component<ILayoutProps, any> {
    /** @hidden @internal */
    selfRef: HTMLDivElement;

    /** @hidden @internal */
    private model: Model;
    /** @hidden @internal */
    private rect: Rect;
    /** @hidden @internal */
    private centerRect: Rect;

    /** @hidden @internal */
    private start: number;
    /** @hidden @internal */
    private layoutTime: number;

    /** @hidden @internal */
    private tabIds: Array<string>;
    /** @hidden @internal */
    private newTabJson: any;
    /** @hidden @internal */
    private firstMove: boolean;
    /** @hidden @internal */
    private dragNode: (Node & IDraggable);
    /** @hidden @internal */
    private dragDiv: HTMLDivElement;
    /** @hidden @internal */
    private dragDivText: string;
    /** @hidden @internal */
    private dropInfo: any;
    /** @hidden @internal */
    private outlineDiv: HTMLDivElement;

    /** @hidden @internal */
    private edgeRightDiv: HTMLDivElement;
    /** @hidden @internal */
    private edgeBottomDiv: HTMLDivElement;
    /** @hidden @internal */
    private edgeLeftDiv: HTMLDivElement;
    /** @hidden @internal */
    private edgeTopDiv: HTMLDivElement;
    /** @hidden @internal */
    private fnNewNodeDropped: () => void;

    constructor(props: ILayoutProps) {
        super(props);
        this.model = this.props.model;
        this.rect = new Rect(0, 0, 0, 0);
        this.model._setChangeListener(this.onModelChange.bind(this));
        this.updateRect = this.updateRect.bind(this);
        this.tabIds = [];
    }

    /** @hidden @internal */
    onModelChange() {
        this.forceUpdate();
        if (this.props.onModelChange) {
            this.props.onModelChange(this.model)
        }
    }

    /** @hidden @internal */
    doAction(action: Action) {
        if (this.props.onAction !== undefined) {
            this.props.onAction(action);
        }
        else {
            this.model.doAction(action);
        }
    }

    /** @hidden @internal */
    componentWillReceiveProps(newProps: ILayoutProps) {
        if (this.model !== newProps.model) {
            if (this.model != null) {
                this.model._setChangeListener(null); // stop listening to old model
            }
            this.model = newProps.model;
            this.model._setChangeListener(this.onModelChange.bind(this));
            this.forceUpdate();
        }
    }

    /** @hidden @internal */
    componentDidMount() {
        this.updateRect();

        // need to re-render if size changes
        window.addEventListener("resize", this.updateRect);
    }

    /** @hidden @internal */
    componentDidUpdate() {
        this.updateRect();
        //console.log("Layout time: " + this.layoutTime + "ms Render time: " + (Date.now() - this.start) + "ms");
    }

    /** @hidden @internal */
    updateRect() {
        const domRect = this.selfRef.getBoundingClientRect();
        const rect = new Rect(0, 0, domRect.width, domRect.height);
        if (!rect.equals(this.rect)) {
            this.rect = rect;
            this.forceUpdate();
        }
    }

    /** @hidden @internal */
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateRect);
    }

    /** @hidden @internal */
    render() {
        this.start = Date.now();
        const borderComponents: Array<React.ReactNode> = [];
        const tabSetComponents: Array<React.ReactNode> = [];
        const tabComponents: JSMap<React.ReactNode> = {};
        const splitterComponents: Array<React.ReactNode> = [];

        this.centerRect = this.model._layout(this.rect);

        this.renderBorder(this.model.getBorderSet(), borderComponents, tabComponents, splitterComponents);
        this.renderChildren(this.model.getRoot(), tabSetComponents, tabComponents, splitterComponents);

        const nextTopIds: Array<string> = [];
        const nextTopIdsMap: JSMap<string> = {};

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
            <div ref={self => this.selfRef = self} className="flexlayout__layout">
                {tabSetComponents}
                {this.tabIds.map(t => {
                    return tabComponents[t];
                })}
                {borderComponents}
                {splitterComponents}
            </div>
        );
    }

    /** @hidden @internal */
    renderBorder(borderSet: BorderSet, borderComponents: Array<React.ReactNode>, tabComponents: JSMap<React.ReactNode>, splitterComponents: Array<React.ReactNode>) {
        for (let i = 0; i < borderSet.getBorders().length; i++) {
            const border = borderSet.getBorders()[i];
            if (border.isShowing()) {
                borderComponents.push(<BorderTabSet key={"border_" + border.getLocation().getName()} border={border}
                    layout={this} />);
                const drawChildren = border._getDrawChildren();
                for (let i = 0; i < drawChildren.length; i++) {
                    const child = drawChildren[i];

                    if (child instanceof SplitterNode) {
                        splitterComponents.push(<Splitter key={child.getId()} layout={this} node={child}></Splitter>);
                    }
                    else if (child instanceof TabNode) {
                        tabComponents[child.getId()] = <Tab
                            key={child.getId()}
                            layout={this}
                            node={child}
                            selected={i === border.getSelected()}
                            factory={this.props.factory}>
                        </Tab>;
                    }
                }
            }
        }
    }

    /** @hidden @internal */
    renderChildren(node: (RowNode | TabSetNode), tabSetComponents: Array<React.ReactNode>, tabComponents: JSMap<React.ReactNode>, splitterComponents: Array<React.ReactNode>) {
        const drawChildren = node._getDrawChildren();

        for (let i = 0; i < drawChildren.length; i++) {
            const child = drawChildren[i];

            if (child instanceof SplitterNode) {
                splitterComponents.push(<Splitter key={child.getId()} layout={this} node={child}></Splitter>);
            }
            else if (child instanceof TabSetNode) {
                tabSetComponents.push(<TabSet key={child.getId()} layout={this} node={child}></TabSet>);
                this.renderChildren(child, tabSetComponents, tabComponents, splitterComponents);
            }
            else if (child instanceof TabNode) {
                const selectedTab = child.getParent().getChildren()[(child.getParent() as TabSetNode).getSelected()];
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
                this.renderChildren(child as RowNode, tabSetComponents, tabComponents, splitterComponents);
            }
        }
    }

    /**
     * Adds a new tab to the given tabset
     * @param tabsetId the id of the tabset where the new tab will be added
     * @param json the json for the new tab node
    */
    addTabToTabSet(tabsetId: string, json: any) {
        const tabsetNode = this.model.getNodeById(tabsetId);
        if (tabsetNode != null) {
            this.doAction(Actions.addNode(json, tabsetId, DockLocation.CENTER, -1));
        }
    }

    /**
     * Adds a new tab to the active tabset (if there is one)
     * @param json the json for the new tab node
     * @hidden @internal 
     */
    addTabToActiveTabSet(json: any) {
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
    addTabWithDragAndDrop(dragText: string, json: any, onDrop: () => void) {
        this.fnNewNodeDropped = onDrop;
        this.newTabJson = json;
        this.dragStart(null, dragText, TabNode._fromJson(json, this.model), null, null, null);
    }

    /**
     * Adds a new tab by dragging a labeled panel to the drop location, dragging starts when you
     * mouse down on the panel
     *
     * @param dragText the text to show on the drag panel
     * @param json the json for the new tab node
     * @param onDrop a callback to call when the drag is complete
     */
    addTabWithDragAndDropIndirect(dragText: string, json: any, onDrop: () => void) {
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

    /** @hidden @internal */
    onCancelAdd() {
        const rootdiv = ReactDOM.findDOMNode(this);
        rootdiv.removeChild(this.dragDiv);
        this.dragDiv = null;
        if (this.fnNewNodeDropped != null) {
            this.fnNewNodeDropped();
            this.fnNewNodeDropped = null;
        }
        DragDrop.instance.hideGlass();
        this.newTabJson = null;
    }

    /** @hidden @internal */
    onCancelDrag(wasDragging: boolean) {
        if (wasDragging) {
            const rootdiv = ReactDOM.findDOMNode(this) as HTMLDivElement;

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
            this.newTabJson = null;
        }
    }

    /** @hidden @internal */
    onDragDivMouseDown(event: Event) {
        event.preventDefault();
        this.dragStart(event, this.dragDivText,
            TabNode._fromJson(this.newTabJson, this.model), true, null, null);
    }

    /** @hidden @internal */
    dragStart(event: Event, dragDivText: string, node: (Node & IDraggable), allowDrag: boolean, onClick: (event: Event) => void, onDoubleClick: (event: Event) => void) {
        if (this.model.getMaximizedTabset() != null || !allowDrag) {
            DragDrop.instance.startDrag(event, null, null, null, null, onClick, onDoubleClick);
        }
        else {
            this.dragNode = node;
            this.dragDivText = dragDivText;
            DragDrop.instance.startDrag(event, this.onDragStart.bind(this), this.onDragMove.bind(this), this.onDragEnd.bind(this), this.onCancelDrag.bind(this), onClick, onDoubleClick);
        }
    }

    /** @hidden @internal */
    onDragStart(event: React.FormEvent<Element>) {
        this.dropInfo = null;
        const rootdiv = ReactDOM.findDOMNode(this) as HTMLElement;
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

        if (this.dragNode != null && this.dragNode instanceof TabNode && this.dragNode.getTabRect() != null) {
            this.dragNode.getTabRect().positionElement(this.outlineDiv);
        }
        this.firstMove = true;

        return true;
    }

    /** @hidden @internal */
    onDragMove(event: React.MouseEvent<Element>) {
        if (this.firstMove === false) {
            this.outlineDiv.style.transition = "top .3s, left .3s, width .3s, height .3s";
        }
        this.firstMove = false;
        const clientRect = this.selfRef.getBoundingClientRect();
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

    /** @hidden @internal */
    onDragEnd(event: React.FormEvent<Element>) {
        const rootdiv = ReactDOM.findDOMNode(this) as HTMLElement;
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

    /** @hidden @internal */
    showEdges(rootdiv: HTMLElement) {
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

    /** @hidden @internal */
    hideEdges(rootdiv: HTMLElement) {
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

    /** @hidden @internal */
    maximize(tabsetNode: TabSetNode) {
        this.doAction(Actions.maximizeToggle(tabsetNode.getId()));
    }

    /** @hidden @internal */
    customizeTab(tabNode: TabNode, renderValues: { leading: React.ReactNode, content: React.ReactNode }) {
        if (this.props.onRenderTab) {
            this.props.onRenderTab(tabNode, renderValues);
        }
    }

    /** @hidden @internal */
    customizeTabSet(tabSetNode: (TabSetNode | BorderNode), renderValues: { headerContent?: React.ReactNode, buttons: Array<React.ReactNode> }) {
        if (this.props.onRenderTabSet) {
            this.props.onRenderTabSet(tabSetNode, renderValues);
        }
    }
}

export default Layout;
