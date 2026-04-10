import { Attribute } from "./Attributes";
import { Attributes } from "./Attributes";
import { DockLocation } from "./DockLocation";
import { DropInfo } from "./DropInfo";
import { Rect } from "./Rect";
import { Action } from "./Actions";
import { Actions } from "./Actions";
import { BorderNode } from "./BorderNode";
import { BorderSet } from "./BorderSet";
import { IDraggable } from "./IDraggable";
import { IDropTarget } from "./IDropTarget";
import { IGlobalAttributes, IJsonModel, IJsonSubLayout, IJsonRowNode, ITabSetAttributes } from "./IJsonModel";
import { Node } from "./Node";
import { RowNode } from "./RowNode";
import { TabNode } from "./TabNode";
import { TabSetNode } from "./TabSetNode";
import { randomUUID } from "./Utils";
import { Layout } from "./Layout";

/** @internal */
export const DefaultMin = 1;
/** @internal */
export const DefaultMax = 99999;

/**
 * Class containing the Tree of Nodes used by the FlexLayout component
 */
export class Model {
    static MAIN_LAYOUT_ID = "__main_layout_id__";

    /** @internal */
    private static attributeDefinitions: Attributes = Model.createAttributeDefinitions();

    /** @internal */
    private attributes: Record<string, any>;
    /** @internal */
    private layouts: Map<string, Layout>;
    /** @internal */
    private borders: BorderSet;
    /** @internal */
    private changeListeners: ((action: Action) => void)[];
    /** @internal */
    private idMap: Map<string, Node>;
    /** @internal */
    private mainLayout: Layout;
    /** @internal */
    private splitterSize?: number;
    /** @internal */
    private onAllowDrop?: (dragNode: Node, dropInfo: DropInfo) => boolean;
    /** @internal */
    private onCreateTabSet?: (tabNode?: TabNode) => ITabSetAttributes;

    /**
     * 'private' constructor. Use the static method Model.fromJson(json) to create a model
     *  @internal
     */
    protected constructor() {
        this.attributes = {};
        this.layouts = new Map<string, Layout>();
        this.borders = new BorderSet(this);
        this.idMap = new Map();
        this.changeListeners = [];
        this.mainLayout = new Layout(Model.MAIN_LAYOUT_ID, "window", Rect.empty());
        this.layouts.set(Model.MAIN_LAYOUT_ID, this.mainLayout);
        this.splitterSize = 8;
    }

    /**
     * Update the node tree by performing the given action,
     * Actions should be generated via static methods on the Actions class
     * @param action the action to perform
     * @returns added Node for Actions.addNode, layoutId for createPopout
     */
    doAction(action: Action): any {
        let returnVal = undefined;
        // console.log(action);
        switch (action.type) {
            case Actions.ADD_TAB: {
                const newNode = new TabNode(this, action.data.json, true);
                const toNode = this.idMap.get(action.data.toNode) as Node & IDraggable;
                if (toNode instanceof TabSetNode || toNode instanceof BorderNode || toNode instanceof RowNode) {
                    toNode.drop(newNode, DockLocation.getByName(action.data.location), action.data.index, action.data.select);
                    returnVal = newNode;
                }
                break;
            }
            case Actions.MOVE_NODE: {
                const fromNode = this.idMap.get(action.data.fromNode) as Node & IDraggable;

                if (fromNode instanceof TabNode || fromNode instanceof TabSetNode || fromNode instanceof RowNode) {
                    if (fromNode === this.getMaximizedTabset(fromNode.getLayoutId())) {
                        const fromLayout = this.layouts.get(fromNode.getLayoutId())!;
                        fromLayout.setMaximizedTabSet(undefined);
                    }
                    const toNode = this.idMap.get(action.data.toNode) as Node & IDropTarget;
                    if (toNode instanceof TabSetNode || toNode instanceof BorderNode || toNode instanceof RowNode) {
                        toNode.drop(fromNode, DockLocation.getByName(action.data.location), action.data.index, action.data.select);
                    }
                }
                break;
            }
            case Actions.DELETE_TAB: {
                const node = this.idMap.get(action.data.node);
                if (node instanceof TabNode) {
                    node.delete();
                }
                break;
            }
            case Actions.DELETE_TABSET: {
                const node = this.idMap.get(action.data.node);

                if (node instanceof TabSetNode) {
                    // first delete all child tabs that are closeable
                    const children = [...node.getChildren()];
                    for (let i = 0; i < children.length; i++) {
                        const child = children[i];
                        if ((child as TabNode).isEnableClose()) {
                            (child as TabNode).delete();
                        }
                    }

                    if (node.getChildren().length === 0) {
                        node.delete();
                    }
                    this.tidy();
                }
                break;
            }
            case Actions.POPOUT_TABSET: {
                const node = this.idMap.get(action.data.node);
                if (node instanceof TabSetNode) {
                    const isMaximized = node.isMaximized();
                    const oldLayout = node.getLayout()!;
                    const layoutId = randomUUID();
                    const type = action.data.type || "window";

                    const layout = new Layout(layoutId, type, oldLayout.getToExportRectFunction()(node.getRect(), type));
                    const json = {
                        type: "row"
                    }
                    const row = RowNode.fromJson(json, this, layout);
                    layout.setRootRow(row);
                    this.layouts.set(layoutId, layout);
                    row.drop(node, DockLocation.CENTER, 0);
                    
                    if (isMaximized) {
                        this.mainLayout.setMaximizedTabSet(undefined);
                    }
                }
                break;
            }
            case Actions.POPOUT_TAB: {
                const node = this.idMap.get(action.data.node);
                if (node instanceof TabNode) {
                    const layoutId = randomUUID()

                    const parent = node.getParent() as (TabSetNode | BorderNode);
                    const popoutRect = parent.getContentRect();
                    const oldLayout = node.getLayout()!;
                    const type = action.data.type || "window";
                    const layout = new Layout(layoutId, type, oldLayout.getToExportRectFunction()(popoutRect, type));
                    const tabsetId = randomUUID();
                    const json: IJsonRowNode = {
                        type: "row",
                        children: [
                            { type: "tabset", id: tabsetId }
                        ]
                    }
                    const row = RowNode.fromJson(json, this, layout);
                    layout.setRootRow(row);
                    this.layouts.set(layoutId, layout);
                    
                    const tabset = this.idMap.get(tabsetId) as TabSetNode & IDropTarget;
                    tabset.drop(node, DockLocation.CENTER, 0, true);
                }
                break;
            }

            case Actions.SELECT_TAB: {
                const tabNode = this.idMap.get(action.data.tabNode);
                if (tabNode instanceof TabNode) {
                    const parent = tabNode.getParent() as Node;
                    const pos = parent.getChildren().indexOf(tabNode);

                    if (parent instanceof BorderNode) {
                        if (parent.getSelected() === pos) {
                            parent.setSelected(-1);
                        } else {
                            parent.setSelected(pos);
                        }
                    } else if (parent instanceof TabSetNode) {
                        if (parent.getSelected() !== pos) {
                            parent.setSelected(pos);
                        }
                        const layout = tabNode.getLayout()!;
                        layout.setActiveTabSet(parent);
                    }
                }
                break;
            }
            case Actions.SET_ACTIVE_TABSET: {
                const layoutId = action.data.layoutId ? action.data.layoutId : Model.MAIN_LAYOUT_ID;
                const layout = this.layouts.get(layoutId)!;
                if (action.data.tabsetNode === undefined) {
                    layout.setActiveTabSet(undefined);
                } else {
                    const tabsetNode = this.idMap.get(action.data.tabsetNode);
                    if (tabsetNode instanceof TabSetNode) {
                        layout.setActiveTabSet(tabsetNode);
                    }
                }
                break;
            }
            case Actions.ADJUST_WEIGHTS: {
                const row = this.idMap.get(action.data.nodeId) as RowNode;
                const c = row.getChildren();
                for (let i = 0; i < c.length; i++) {
                    const n = c[i] as TabSetNode | RowNode;
                    n.setWeight(action.data.weights[i]);
                }
                break;
            }
            case Actions.ADJUST_BORDER_SPLIT: {
                const node = this.idMap.get(action.data.node);
                if (node instanceof BorderNode) {
                    node.setSize(action.data.size);
                }
                break;
            }
            case Actions.MAXIMIZE_TOGGLE: {
                const layoutId = action.data.layoutId ? action.data.layoutId : Model.MAIN_LAYOUT_ID;
                const layout = this.layouts.get(layoutId)!;
                const node = this.idMap.get(action.data.node);
                if (node instanceof TabSetNode) {
                    if (node === layout.getMaximizedTabSet()) {
                        layout.setMaximizedTabSet(undefined);
                    } else {
                        layout.setMaximizedTabSet(node);
                        layout.setActiveTabSet(node);
                    }
                }

                break;
            }
            case Actions.UPDATE_MODEL_ATTRIBUTES: {
                this.updateAttrs(action.data.json);
                break;
            }

            case Actions.UPDATE_NODE_ATTRIBUTES: {
                const node = this.idMap.get(action.data.node)!;
                node.updateAttrs(action.data.json);
                break;
            }

            case Actions.RENAME_TAB: {
                const node = this.idMap.get(action.data.node);
                if (node instanceof TabNode) {
                    node.setName(action.data.text);
                }
                break;
            }

            case Actions.CREATE_SUBLAYOUT: {
                const layoutId = randomUUID();
                const layout = new Layout(layoutId, action.data.type || "window", Rect.fromJson(action.data.rect));
                const row = RowNode.fromJson(action.data.layout, this, layout);
                layout.setRootRow(row);
                this.layouts.set(layoutId, layout);
                returnVal = layoutId;
                break;
            }

            case Actions.CLOSE_POPOUT: {
                const oldLayout = this.layouts.get(action.data.layoutId);
                if (oldLayout) {
                    // this.layouts.delete(action.data.layoutId);
                    // const layoutId = randomUUID();
                    // const r = this.mainLayout.getController()!.getDomRect()!;
                    // const newLayout = new Layout(layoutId, "float", new Rect(r.width / 4, r.height / 4, r.width / 2, r.height / 2));
                    // newLayout.setRootRow(oldLayout.getRootRow()!);
                    // this.layouts.set(layoutId, newLayout);

                    oldLayout.setType("float");
                    const r = this.mainLayout.getController()!.getDomRect()!;
                    oldLayout.setRect(new Rect(r.width / 4, r.height / 4, r.width / 2, r.height / 2));
                }
                break;
            }

            case Actions.MOVE_POPOUT_TO_FRONT: {
                const layoutId = action.data.layoutId;
                const layout = this.layouts.get(layoutId);
                if (layout) {
                    this.layouts.delete(layoutId);
                    this.layouts.set(layoutId, layout);
                }
                break;
            }

            default:
                break;
        }

        this.updateIdMap();

        for (const listener of this.changeListeners) {
            listener(action);
        }

        return returnVal;
    }


    /**
     * Get the currently active tabset node
     */
    getActiveTabset(layoutId: string = Model.MAIN_LAYOUT_ID) {
        const layout = this.layouts.get(layoutId);
        if (layout && layout.getActiveTabSet() && this.getNodeById(layout.getActiveTabSet()!.getId())) {
            return layout.getActiveTabSet();
        } else {
            return undefined;
        }
    }

    /**
     * Get the currently maximized tabset node
     */
    getMaximizedTabset(layoutId: string = Model.MAIN_LAYOUT_ID) {
        return this.layouts.get(layoutId)!.getMaximizedTabSet();
    }

    /**
     * Gets the root RowNode of the model
     * @returns {RowNode}
     */
    getRootRow(layoutId: string = Model.MAIN_LAYOUT_ID) {
        return this.layouts.get(layoutId)!.getRootRow()!;
    }

    isRootOrientationVertical() {
        return this.attributes.rootOrientationVertical as boolean;
    }

    isEnableRotateBorderIcons() {
        return this.attributes.enableRotateBorderIcons as boolean;
    }

    /**
     * Gets the
     * @returns {BorderSet|*}
     */
    getBorderSet() {
        return this.borders;
    }

    /**
     * Visits all the nodes in the model and calls the given function for each
     * @param fn a function that takes visited node and a integer level as parameters
     */
    visitNodes(fn: (node: Node, level: number) => void) {
        this.borders.forEachNode(fn);
        for (const [_, w] of this.layouts) {
            w.getRootRow()!.forEachNode(fn, 0);
        }
    }

    visitLayoutNodes(layoutId: string, fn: (node: Node, level: number) => void) {
        if (this.layouts.has(layoutId)) {
            if (layoutId === Model.MAIN_LAYOUT_ID) {
                this.borders.forEachNode(fn);
            }
            this.layouts.get(layoutId)!.visitNodes(fn);
        }
    }

    /**
     * Gets a node by its id
     * @param id the id to find
     */
    getNodeById(id: string): Node | undefined {
        return this.idMap.get(id);
    }

    /**
     * Finds the first/top left tab set of the given node.
     * @param node The top node you want to begin searching from, deafults to the root node
     * @returns The first Tab Set
     */
    getFirstTabSet(node = this.layouts.get(Model.MAIN_LAYOUT_ID)!.getRootRow() as Node): TabSetNode {
        const child = node.getChildren()[0];
        if (child instanceof TabSetNode) {
            return child;
        }
        else {
            return this.getFirstTabSet(child);
        }
    }

    /**
 * Loads the model from the given json object
 * @param json the json model to load
 * @returns {Model} a new Model object
 */
    static fromJson(json: IJsonModel) {
        const model = new Model();
        Model.attributeDefinitions.fromJson(json.global, model.attributes);

        if (json.borders) {
            model.borders = BorderSet.fromJson(json.borders, model);
        }

        const subLayouts = json.subLayouts || json.popouts;

        if (subLayouts) {
            for (const layoutId in subLayouts) {
                const layoutJson = subLayouts[layoutId];
                const layout = Layout.fromJson(layoutJson, model, layoutId);
                model.layouts.set(layoutId, layout);
            }
        }
        model.mainLayout.setRootRow(RowNode.fromJson(json.layout, model, model.mainLayout));
        model.tidy(); // initial tidy of node tree
        return model;
    }

    /**
     * Converts the model to a json object
     * @returns {IJsonModel} json object that represents this model
     */
    toJson(): IJsonModel {
        const global: any = {};
        Model.attributeDefinitions.toJson(global, this.attributes);

        // save state of nodes
        this.visitNodes((node) => {
            node.fireEvent("save", {});
        });

        const subLayouts: Record<string, IJsonSubLayout> = {};
        for (const [id, layout] of this.layouts) {
            if (id !== Model.MAIN_LAYOUT_ID) {
                subLayouts[id] = layout.toJson();
            }
        }

        return {
            global,
            borders: this.borders.toJson(),
            layout: this.mainLayout.getRootRow()!.toJson(),
            subLayouts: subLayouts
        };
    }

    getSplitterSize() {
        return this.splitterSize;
    }

    setSplitterSize(size?: number) {
        this.splitterSize = size;
    }

    isEnableEdgeDock() {
        return this.attributes.enableEdgeDock as boolean;
    }

    isEnableEdgeDockIndicators() {
        return this.attributes.enableEdgeDockIndicators as boolean;
    }

    /**
     * Sets a function to allow/deny dropping a node
     * @param onAllowDrop function that takes the drag node and DropInfo and returns true if the drop is allowed
     */
    setOnAllowDrop(onAllowDrop: (dragNode: Node, dropInfo: DropInfo) => boolean) {
        this.onAllowDrop = onAllowDrop;
    }

    /**
     * set callback called when a new TabSet is created.
     * The tabNode can be undefined if it's the auto created first tabset in the root row (when the last
     * tab is deleted, the root tabset can be recreated)
     * @param onCreateTabSet 
     */
    setOnCreateTabSet(onCreateTabSet: (tabNode?: TabNode) => ITabSetAttributes) {
        this.onCreateTabSet = onCreateTabSet;
    }

    addChangeListener(listener: ((action: Action) => void)) {
        this.changeListeners.push(listener);
    }

    removeChangeListener(listener: ((action: Action) => void)) {
        const pos = this.changeListeners.findIndex(l => l === listener);
        if (pos !== -1) {
            this.changeListeners.splice(pos, 1);
        }
    }

    toString() {
        return JSON.stringify(this.toJson());
    }

    /***********************internal ********************************/

    /** @internal */
    getMainLayout() {
        return this.mainLayout;
    }

    /** @internal */
    getLayouts() {
        return this.layouts;
    }

    /** @internal */
    sortLayouts() {
        const priority: any = { window: 1, tab: 2, float: 3 };

        const sorted = Array.from(this.getLayouts().values()).sort((a, b) => {
            return priority[a.getType()] - priority[b.getType()];
        });
        this.layouts.clear();
        sorted.forEach(layout => this.layouts.set(layout.getLayoutId(), layout));
    }

    /** @internal */
    setActiveTabset(tabsetNode: TabSetNode | undefined, layoutId: string) {
        const layout = this.layouts.get(layoutId);
        if (layout) {
            if (tabsetNode) {
                layout.setActiveTabSet(tabsetNode);
            } else {
                layout.setActiveTabSet(undefined);
            }
        }
    }

    /** @internal */
    setMaximizedTabset(tabsetNode: (TabSetNode | undefined), layoutId: string) {
        const layout = this.layouts.get(layoutId);
        if (layout) {
            if (tabsetNode) {
                layout.setMaximizedTabSet(tabsetNode);
            } else {
                layout.setMaximizedTabSet(undefined);
            }
        }
    }

    /** @internal */
    updateIdMap() {
        // regenerate idMap to stop it building up
        this.idMap.clear();
        this.visitNodes((node) => {
            this.idMap.set(node.getId(), node)
            // if (node instanceof RowNode) {
            //     node.normalizeWeights();
            // }
        });
        // console.log(JSON.stringify(Object.keys(this._idMap)));
    }

    /** @internal */
    addNode(node: Node) {
        const id = node.getId();
        if (this.idMap.has(id)) {
            throw new Error(`Error: each node must have a unique id, duplicate id:${node.getId()}`);
        }

        this.idMap.set(id, node);
    }

    /** @internal */
    findDropTargetNode(layoutId: string, dragNode: Node & IDraggable, x: number, y: number) {
        let node = (this.layouts.get(layoutId)!.getRootRow() as RowNode).findDropTargetNode(layoutId, dragNode, x, y);
        if (node === undefined && layoutId === Model.MAIN_LAYOUT_ID) {
            node = this.borders.findDropTargetNode(dragNode, x, y);
        }
        return node;
    }

    /** @internal */
    tidy() {
        // console.log("before _tidy", this.toString());
        for (const [_, layout] of this.layouts) {
            layout.getRootRow()!.tidy();
        }
        // console.log("after _tidy", this.toString());
    }

    /** @internal */
    updateAttrs(json: IGlobalAttributes) {
        Model.attributeDefinitions.update(json, this.attributes);
    }

    /** @internal */
    nextUniqueId() {
        return '#' + randomUUID();
    }

    /** @internal */
    getAttribute(name: string): any {
        return this.attributes[name];
    }

    /** @internal */
    getOnAllowDrop() {
        return this.onAllowDrop;
    }

    /** @internal */
    getOnCreateTabSet() {
        return this.onCreateTabSet;
    }

    static toTypescriptInterfaces() {
        Model.attributeDefinitions.pairAttributes("RowNode", RowNode.getAttributeDefinitions());
        Model.attributeDefinitions.pairAttributes("TabSetNode", TabSetNode.getAttributeDefinitions());
        Model.attributeDefinitions.pairAttributes("TabNode", TabNode.getAttributeDefinitions());
        Model.attributeDefinitions.pairAttributes("BorderNode", BorderNode.getAttributeDefinitions());

        const sb = [];
        sb.push(Model.attributeDefinitions.toTypescriptInterface("Global", undefined));
        sb.push(RowNode.getAttributeDefinitions().toTypescriptInterface("Row", Model.attributeDefinitions));
        sb.push(TabSetNode.getAttributeDefinitions().toTypescriptInterface("TabSet", Model.attributeDefinitions));
        sb.push(TabNode.getAttributeDefinitions().toTypescriptInterface("Tab", Model.attributeDefinitions));
        sb.push(BorderNode.getAttributeDefinitions().toTypescriptInterface("Border", Model.attributeDefinitions));
        console.log(sb.join("\n"));
    }

    /** @internal */
    private static createAttributeDefinitions(): Attributes {
        const attributeDefinitions = new Attributes();

        attributeDefinitions.add("enableEdgeDock", true).setType(Attribute.BOOLEAN).setDescription(
            `enable docking to the edges of the layout`
        );
        attributeDefinitions.add("enableEdgeDockIndicators", true).setType(Attribute.BOOLEAN).setDescription(
            `show the edge indicators when dragging`
        );
        attributeDefinitions.add("rootOrientationVertical", false).setType(Attribute.BOOLEAN).setDescription(
            `the top level 'row' will layout horizontally by default, set this option true to make it layout vertically`
        );
        attributeDefinitions.add("enableRotateBorderIcons", true).setType(Attribute.BOOLEAN).setDescription(
            `boolean indicating if tab icons should rotate with the text in the left and right borders`
        );

        // tab
        attributeDefinitions.add("tabEnableClose", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabCloseType", 1).setType("ICloseType");
        attributeDefinitions.add("tabEnablePopout", false).setType(Attribute.BOOLEAN).setAlias("tabEnableFloat");
        attributeDefinitions.add("tabEnablePopoutIcon", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabEnablePopoutFloatIcon", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabEnablePopoutOverlay", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabEnableDrag", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabEnableRename", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabContentClassName", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("tabClassName", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("tabIcon", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("tabEnableRenderOnDemand", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabBorderWidth", -1).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabBorderHeight", -1).setType(Attribute.NUMBER);

        // tabset
        attributeDefinitions.add("tabSetEnableDeleteWhenEmpty", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableDrop", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableDrag", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableDivide", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableMaximize", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableClose", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableCloseButton", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableSingleTabStretch", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetAutoSelectTab", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableActiveIcon", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetClassNameTabStrip", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("tabSetEnableTabStrip", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableTabWrap", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetTabLocation", "top").setType("ITabLocation");
        attributeDefinitions.add("tabMinWidth", DefaultMin).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabMinHeight", DefaultMin).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabSetMinWidth", DefaultMin).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabSetMinHeight", DefaultMin).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabMaxWidth", DefaultMax).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabMaxHeight", DefaultMax).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabSetMaxWidth", DefaultMax).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabSetMaxHeight", DefaultMax).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabSetEnableTabScrollbar", false).setType(Attribute.BOOLEAN);

        // border
        attributeDefinitions.add("borderSize", 200).setType(Attribute.NUMBER);
        attributeDefinitions.add("borderMinSize", DefaultMin).setType(Attribute.NUMBER);
        attributeDefinitions.add("borderMaxSize", DefaultMax).setType(Attribute.NUMBER);
        attributeDefinitions.add("borderEnableDrop", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("borderAutoSelectTabWhenOpen", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("borderAutoSelectTabWhenClosed", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("borderClassName", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("borderEnableAutoHide", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("borderEnableTabScrollbar", false).setType(Attribute.BOOLEAN);

        return attributeDefinitions;
    }
}
