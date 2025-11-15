import { Attribute } from "../Attribute";
import { AttributeDefinitions } from "../AttributeDefinitions";
import { DockLocation } from "../DockLocation";
import { DropInfo } from "../DropInfo";
import { Rect } from "../Rect";
import { Action } from "./Action";
import { Actions } from "./Actions";
import { BorderNode } from "./BorderNode";
import { BorderSet } from "./BorderSet";
import { IDraggable } from "./IDraggable";
import { IDropTarget } from "./IDropTarget";
import { IJsonModel, IJsonPopout, IJsonFloating, ITabSetAttributes } from "./IJsonModel";
import { Node } from "./Node";
import { RowNode } from "./RowNode";
import { TabNode } from "./TabNode";
import { TabSetNode } from "./TabSetNode";
import { randomUUID } from "./Utils";
import { LayoutWindow } from "./LayoutWindow";

/** @internal */
export const DefaultMin = 0;
/** @internal */
export const DefaultMax = 99999;

/**
 * Class containing the Tree of Nodes used by the FlexLayout component
 */
export class Model {
    static MAIN_WINDOW_ID = "__main_window_id__";

    /** @internal */
    private static attributeDefinitions: AttributeDefinitions = Model.createAttributeDefinitions();

    /** @internal */
    private attributes: Record<string, any>;
    /** @internal */
    private idMap: Map<string, Node>;
    /** @internal */
    private changeListeners: ((action: Action) => void)[];
    /** @internal */
    private borders: BorderSet;
    /** @internal */
    private onAllowDrop?: (dragNode: Node, dropInfo: DropInfo) => boolean;
    /** @internal */
    private onCreateTabSet?: (tabNode?: TabNode) => ITabSetAttributes;
    /** @internal */
    private windows: Map<string, LayoutWindow>;
    /** @internal */
    private rootWindow: LayoutWindow;
    /** @internal */
    private floatings: Map<string, IJsonFloating>;
    /** @internal */
    private floatingNodes: Map<string, TabNode>;

    /**
     * 'private' constructor. Use the static method Model.fromJson(json) to create a model
     *  @internal
     */
    protected constructor() {
        this.attributes = {};
        this.idMap = new Map();
        this.borders = new BorderSet(this);
        this.windows = new Map<string, LayoutWindow>();
        this.rootWindow = new LayoutWindow(Model.MAIN_WINDOW_ID, Rect.empty());
        this.windows.set(Model.MAIN_WINDOW_ID, this.rootWindow);
        this.floatings = new Map<string, IJsonFloating>();
        this.floatingNodes = new Map<string, TabNode>();
        this.changeListeners = [];
    }

    /**
     * Update the node tree by performing the given action,
     * Actions should be generated via static methods on the Actions class
     * @param action the action to perform
     * @returns added Node for Actions.addNode, windowId for createWindow
     */
    doAction(action: Action): any {
        let returnVal = undefined;
        // console.log(action);
        switch (action.type) {
            case Actions.ADD_NODE: {
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
                    if (fromNode === this.getMaximizedTabset(fromNode.getWindowId())) {
                        const fromWindow = this.windows.get(fromNode.getWindowId())!;
                        fromWindow.maximizedTabSet = undefined;
                    }
                    const toNode = this.idMap.get(action.data.toNode) as Node & IDropTarget;
                    if (toNode instanceof TabSetNode || toNode instanceof BorderNode || toNode instanceof RowNode) {
                        toNode.drop(fromNode, DockLocation.getByName(action.data.location), action.data.index, action.data.select);
                    }
                }
                this.removeEmptyWindows();
                break;
            }
            case Actions.DELETE_TAB: {
                const node = this.idMap.get(action.data.node);
                if (node instanceof TabNode) {
                    node.delete();
                }
                this.removeEmptyWindows();
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
                this.removeEmptyWindows();
                break;
            }
            case Actions.POPOUT_TABSET: {
                const node = this.idMap.get(action.data.node);
                if (node instanceof TabSetNode) {
                    const isMaximized = node.isMaximized();
                    const oldLayoutWindow = this.windows.get(node.getWindowId())!;
                    const windowId = randomUUID()
                    const layoutWindow = new LayoutWindow(windowId, oldLayoutWindow.toScreenRectFunction(node.getRect()));
                    const json = {
                        type: "row",
                        children: []
                    }
                    const row = RowNode.fromJson(json, this, layoutWindow);
                    layoutWindow.root = row;
                    this.windows.set(windowId, layoutWindow);
                    row.drop(node, DockLocation.CENTER, 0);

                    if (isMaximized) {
                        this.rootWindow.maximizedTabSet = undefined;
                    }
                }
                this.removeEmptyWindows();
                break;
            }
            case Actions.POPOUT_TAB: {
                const node = this.idMap.get(action.data.node);
                if (node instanceof TabNode) {
                    const windowId = randomUUID()
                    let r = Rect.empty();
                    if (node.getParent() instanceof TabSetNode) {
                        r = node.getParent()!.getRect();
                    } else  {
                        r = (node.getParent() as BorderNode).getContentRect();
                    }
                    const oldLayoutWindow = this.windows.get(node.getWindowId())!;
                    const layoutWindow = new LayoutWindow(windowId, oldLayoutWindow.toScreenRectFunction(r));
                    const tabsetId = randomUUID();
                    const json = {
                        type: "row",
                        children: [
                            { type: "tabset", id: tabsetId }
                        ]
                    }
                    const row = RowNode.fromJson(json, this, layoutWindow);
                    layoutWindow.root = row;
                    this.windows.set(windowId, layoutWindow);

                    const tabset = this.idMap.get(tabsetId) as TabSetNode & IDropTarget;
                    tabset.drop(node, DockLocation.CENTER, 0, true);
                }
                this.removeEmptyWindows();
                break;
            }
            case Actions.CLOSE_WINDOW: {
                const window = this.windows.get(action.data.windowId);
                if (window) {
                    this.rootWindow.root?.drop(window!.root!, DockLocation.CENTER, -1);
                    this.rootWindow.visitNodes((node, level) => {
                        if (node instanceof RowNode) {
                            node.setWindowId(Model.MAIN_WINDOW_ID);
                        }
                    })

                    // this.getFirstTabSet().drop(window?.root!,DockLocation.CENTER, -1);

                    this.windows.delete(action.data.windowId);
                }
                break;
            }
            case Actions.CREATE_WINDOW: {
                const windowId = randomUUID();
                const layoutWindow = new LayoutWindow(windowId, Rect.fromJson(action.data.rect));
                const row = RowNode.fromJson(action.data.layout, this, layoutWindow);
                layoutWindow.root = row;
                this.windows.set(windowId, layoutWindow);
                returnVal = windowId;
                break;
            }
            case Actions.FLOAT_TAB: {
                const node = this.idMap.get(action.data.node);
                if (node instanceof TabNode) {
                    let rect = Rect.empty();

                    // Use saved position and size if available
                    const savedX = node.getX();
                    const savedY = node.getY();
                    const savedWidth = node.getFloatingWidth();
                    const savedHeight = node.getFloatingHeight();

                    if (savedX !== undefined && savedY !== undefined) {
                        // Use saved position and size from previous float
                        if (node.getParent() instanceof TabSetNode) {
                            rect = node.getParent()!.getRect();
                        } else if (node.getParent() instanceof BorderNode) {
                            rect = (node.getParent() as BorderNode).getContentRect();
                        }
                        // Use saved size if available, otherwise use parent rect size
                        const width = savedWidth !== undefined ? savedWidth : rect.width;
                        const height = savedHeight !== undefined ? savedHeight : rect.height;
                        rect = new Rect(savedX, savedY, width, height);
                    } else {
                        // Use parent rect for first time float
                        if (node.getParent() instanceof TabSetNode) {
                            rect = node.getParent()!.getRect();
                        } else if (node.getParent() instanceof BorderNode) {
                            rect = (node.getParent() as BorderNode).getContentRect();
                        }
                    }

                    const parent = node.getParent();
                    let originalParentId = "";
                    let originalIndex = -1;

                    if (parent) {
                        originalParentId = parent.getId();
                        originalIndex = parent.getChildren().indexOf(node);
                        if (parent instanceof TabSetNode || parent instanceof BorderNode) {
                            parent.remove(node);
                        }
                        (node as any).parent = null;
                    }

                    const floatingId = randomUUID();
                    const floating: IJsonFloating = {
                        tabId: node.getId(),
                        rect: rect.toJson(),
                        zIndex: this.getNextZIndex(),
                        originalParentId,
                        originalIndex
                    };

                    this.floatings.set(floatingId, floating);
                    this.floatingNodes.set(node.getId(), node);
                }
                break;
            }
            case Actions.UNFLOAT_TAB: {
                const floatingId = action.data.floatingId;
                const floating = this.floatings.get(floatingId);
                if (floating) {
                    const tabNode = this.idMap.get(floating.tabId);
                    if (tabNode instanceof TabNode) {
                        // Save current floating position and size to tab for next float
                        tabNode.setX(floating.rect.x);
                        tabNode.setY(floating.rect.y);
                        tabNode.setFloatingWidth(floating.rect.width);
                        tabNode.setFloatingHeight(floating.rect.height);

                        // Remove from floating
                        this.floatings.delete(floatingId);
                        this.floatingNodes.delete(floating.tabId);

                        // Get original parent
                        const originalParent = this.idMap.get(floating.originalParentId);

                        if (originalParent && 'children' in originalParent && Array.isArray((originalParent as any).children)) {
                            // Add back to original parent at original position
                            const children = (originalParent as any).children;
                            const insertIndex = Math.min(floating.originalIndex, children.length);
                            children.splice(insertIndex, 0, tabNode);
                            (tabNode as any).parent = originalParent;

                            // Select the restored tab
                            if (typeof (originalParent as any).setSelected === 'function') {
                                (originalParent as any).setSelected(insertIndex);
                            }
                        } else {
                            // Fallback: add to first available tabset
                            const firstTabSet = this.getFirstTabSet();
                            if (firstTabSet && 'children' in firstTabSet) {
                                const children = (firstTabSet as any).children;
                                children.push(tabNode);
                                (tabNode as any).parent = firstTabSet;

                                if (typeof (firstTabSet as any).setSelected === 'function') {
                                    (firstTabSet as any).setSelected(children.length - 1);
                                }
                            }
                        }
                    }
                }
                break;
            }
            case Actions.RENAME_TAB: {
                const node = this.idMap.get(action.data.node);
                if (node instanceof TabNode) {
                    node.setName(action.data.text);
                }
                break;
            }
            case Actions.SELECT_TAB: {
                const tabNode = this.idMap.get(action.data.tabNode);
                const windowId = action.data.windowId ? action.data.windowId : Model.MAIN_WINDOW_ID;
                const window = this.windows.get(windowId)!;
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
                        window.activeTabSet = parent;
                    }
                }
                break;
            }
            case Actions.SET_ACTIVE_TABSET: {
                const windowId = action.data.windowId ? action.data.windowId : Model.MAIN_WINDOW_ID;
                const window = this.windows.get(windowId)!;
                if (action.data.tabsetNode === undefined) {
                    window.activeTabSet = undefined;
                } else {
                    const tabsetNode = this.idMap.get(action.data.tabsetNode);
                    if (tabsetNode instanceof TabSetNode) {
                        window.activeTabSet = tabsetNode;
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
                    node.setSize(action.data.pos);
                }
                break;
            }
            case Actions.MAXIMIZE_TOGGLE: {
                const windowId = action.data.windowId ? action.data.windowId : Model.MAIN_WINDOW_ID;
                const window = this.windows.get(windowId)!;
                const node = this.idMap.get(action.data.node);
                if (node instanceof TabSetNode) {
                    if (node === window.maximizedTabSet) {
                        window.maximizedTabSet = undefined;
                    } else {
                        window.maximizedTabSet = node;
                        window.activeTabSet = node;
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
    getActiveTabset(windowId: string = Model.MAIN_WINDOW_ID) {
        const window = this.windows.get(windowId);
        if (window && window.activeTabSet && this.getNodeById(window.activeTabSet.getId())) {
            return window.activeTabSet;
        } else {
            return undefined;
        }
    }

    /**
     * Get the currently maximized tabset node
     */
    getMaximizedTabset(windowId: string = Model.MAIN_WINDOW_ID) {
        return this.windows.get(windowId)!.maximizedTabSet;
    }

    /**
     * Gets the root RowNode of the model
     * @returns {RowNode}
     */
    getRoot(windowId: string = Model.MAIN_WINDOW_ID) {
        return this.windows.get(windowId)!.root!;
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

    getwindowsMap() {
        return this.windows;
    }

    /**
     * Gets the floatings map
     * @returns {Map<string, IJsonFloating>}
     */
    getFloatingsMap() {
        return this.floatings;
    }

    /**
     * Removes a floating tab by id
     * @param floatingId
     */
    removeFloating(floatingId: string) {
        const floating = this.floatings.get(floatingId);
        if (floating) {
            this.floatingNodes.delete(floating.tabId);
            this.floatings.delete(floatingId);
        }
    }

    /**
     * Gets the next z-index for floating tabs
     * @returns {number}
     */
    getNextZIndex(): number {
        let maxZ = 1000;
        for (const floating of this.floatings.values()) {
            if (floating.zIndex > maxZ) {
                maxZ = floating.zIndex;
            }
        }
        return maxZ + 1;
    }

    /**
     * Visits all the nodes in the model and calls the given function for each
     * @param fn a function that takes visited node and a integer level as parameters
     */
    visitNodes(fn: (node: Node, level: number) => void) {
        this.borders.forEachNode(fn);
        for (const [_, w] of this.windows) {
            w.root!.forEachNode(fn, 0);
        }
    }

    visitWindowNodes(windowId: string, fn: (node: Node, level: number) => void) {
        if (this.windows.has(windowId)) {
            if (windowId === Model.MAIN_WINDOW_ID) {
                this.borders.forEachNode(fn);
            }
            this.windows.get(windowId)!.visitNodes(fn);
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
    getFirstTabSet(node = this.windows.get(Model.MAIN_WINDOW_ID)!.root as Node): TabSetNode {
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
        if (json.popouts) {
            for (const windowId in json.popouts) {
                const windowJson = json.popouts[windowId];
                const layoutWindow = LayoutWindow.fromJson(windowJson, model, windowId);
                model.windows.set(windowId, layoutWindow);
            }
        }
        if (json.floatings) {
            for (const floatingId in json.floatings) {
                const floatingJson = json.floatings[floatingId];
                // Create TabNode for floating tab but don't add to tree
                const tabNode = TabNode.fromJson(floatingJson, model, true);
                // Set parent to null to mark as floating
                (tabNode as any).parent = null;
                // Store the floating reference
                model.floatings.set(floatingId, {
                    tabId: tabNode.getId(),
                    rect: floatingJson.rect,
                    zIndex: floatingJson.zIndex,
                    originalParentId: floatingJson.originalParentId || "",
                    originalIndex: floatingJson.originalIndex || -1
                });
            }
        }

        model.rootWindow.root = RowNode.fromJson(json.layout, model, model.getwindowsMap().get(Model.MAIN_WINDOW_ID)!);
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

        const windows: Record<string, IJsonPopout> = {};
        for (const [id, window] of this.windows) {
            if (id !== Model.MAIN_WINDOW_ID) {
                windows[id] = window.toJson();
            }
        }

        const floatings: Record<string, any> = {};
        for (const [id, floating] of this.floatings) {
            const tabNode = this.idMap.get(floating.tabId);
            if (tabNode instanceof TabNode) {
                floatings[id] = {
                    ...tabNode.toJson(),
                    rect: floating.rect,
                    zIndex: floating.zIndex,
                    originalParentId: floating.originalParentId,
                    originalIndex: floating.originalIndex
                };
            }
        }

        return {
            global,
            borders: this.borders.toJson(),
            layout: this.rootWindow.root!.toJson(),
            popouts: windows,
            floatings: floatings
        };
    }

    getSplitterSize() {
        return this.attributes.splitterSize as number;
    }

    getSplitterExtra() {
        return this.attributes.splitterExtra as number;
    }

    isEnableEdgeDock() {
        return this.attributes.enableEdgeDock as boolean;
    }

    isSplitterEnableHandle() {
        return this.attributes.splitterEnableHandle as boolean;
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
    removeEmptyWindows() {
        const emptyWindows = new Set<string>();
        for (const [windowId] of this.windows) {
            if (windowId !== Model.MAIN_WINDOW_ID) {
                let count = 0;
                this.visitWindowNodes(windowId, (node) => {
                    if (node instanceof TabNode) {
                        count++;
                    }
                });
                if (count === 0) {
                    emptyWindows.add(windowId);
                }
            }
        }

        for (const windowId of emptyWindows) {
            this.windows.delete(windowId);
        }
    }
    /** @internal */
    setActiveTabset(tabsetNode: TabSetNode | undefined, windowId: string) {
        const window = this.windows.get(windowId);
        if (window) {
            if (tabsetNode) {
                window.activeTabSet = tabsetNode;
            } else {
                window.activeTabSet = undefined;
            }
        }
    }

    /** @internal */
    setMaximizedTabset(tabsetNode: (TabSetNode | undefined), windowId: string) {
        const window = this.windows.get(windowId);
        if (window) {
            if (tabsetNode) {
                window.maximizedTabSet = tabsetNode;
            } else {
                window.maximizedTabSet = undefined;
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

        // Also add floating tab nodes to idMap
        for (const [tabId, tabNode] of this.floatingNodes) {
            this.idMap.set(tabId, tabNode);
        }
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
    findDropTargetNode(windowId: string, dragNode: Node & IDraggable, x: number, y: number) {
        let node = (this.windows.get(windowId)!.root as RowNode).findDropTargetNode(windowId, dragNode, x, y);
        if (node === undefined && windowId === Model.MAIN_WINDOW_ID) {
            node = this.borders.findDropTargetNode(dragNode, x, y);
        }
        return node;
    }

    /** @internal */
    tidy() {
        // console.log("before _tidy", this.toString());
        for (const [_, window] of this.windows) {
            window.root!.tidy();
        }
        // console.log("after _tidy", this.toString());
    }

    /** @internal */
    updateAttrs(json: any) {
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
    private static createAttributeDefinitions(): AttributeDefinitions {
        const attributeDefinitions = new AttributeDefinitions();

        attributeDefinitions.add("enableEdgeDock", true).setType(Attribute.BOOLEAN).setDescription(
            `enable docking to the edges of the layout, this will show the edge indicators`
        );
        attributeDefinitions.add("rootOrientationVertical", false).setType(Attribute.BOOLEAN).setDescription(
            `the top level 'row' will layout horizontally by default, set this option true to make it layout vertically`
        );
        attributeDefinitions.add("enableRotateBorderIcons", true).setType(Attribute.BOOLEAN).setDescription(
            `boolean indicating if tab icons should rotate with the text in the left and right borders`
        );

        // splitter
        attributeDefinitions.add("splitterSize", 8).setType(Attribute.NUMBER).setDescription(
            `width in pixels of all splitters between tabsets/borders`
        );
        attributeDefinitions.add("splitterExtra", 0).setType(Attribute.NUMBER).setDescription(
            `additional width in pixels of the splitter hit test area`
        );
        attributeDefinitions.add("splitterEnableHandle", false).setType(Attribute.BOOLEAN).setDescription(
            `enable a small centralized handle on all splitters`
        );

        // tab
        attributeDefinitions.add("tabEnableClose", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabCloseType", 1).setType("ICloseType");
        attributeDefinitions.add("tabEnablePopout", false).setType(Attribute.BOOLEAN).setAlias("tabEnableFloat");
        attributeDefinitions.add("tabEnablePopoutIcon", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabEnablePopoutOverlay", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabEnableFloat", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabEnableDrag", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabEnableRename", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabContentClassName", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("tabClassName", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("tabIcon", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("tabEnableRenderOnDemand", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabDragSpeed", 0.3).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabBorderWidth", -1).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabBorderHeight", -1).setType(Attribute.NUMBER);

        // tabset
        attributeDefinitions.add("tabSetEnableDeleteWhenEmpty", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableDrop", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableDrag", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableDivide", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableMaximize", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetEnableClose", false).setType(Attribute.BOOLEAN);
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

