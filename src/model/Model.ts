import { Attribute } from "../Attribute";
import { AttributeDefinitions } from "../AttributeDefinitions";
import { DockLocation } from "../DockLocation";
import { DropInfo } from "../DropInfo";
import { Orientation } from "../Orientation";
import { Rect } from "../Rect";
import { Action } from "./Action";
import { Actions } from "./Actions";
import { BorderNode } from "./BorderNode";
import { BorderSet } from "./BorderSet";
import { IDraggable } from "./IDraggable";
import { IDropTarget } from "./IDropTarget";
import { IJsonModel, ITabSetAttributes } from "./IJsonModel";
import { Node } from "./Node";
import { RowNode } from "./RowNode";
import { TabNode } from "./TabNode";
import { TabSetNode } from "./TabSetNode";
import { adjustSelectedIndexAfterDock, adjustSelectedIndexAfterFloat, randomUUID } from "./Utils";

/** @internal */
export interface ILayoutMetrics {
    headerBarSize: number;
    tabBarSize: number;
    borderBarSize: number;
}

/**
 * Class containing the Tree of Nodes used by the FlexLayout component
 */
export class Model {
    /**
     * Loads the model from the given json object
     * @param json the json model to load
     * @returns {Model} a new Model object
     */
    static fromJson(json: IJsonModel) {
        const model = new Model();
        Model._attributeDefinitions.fromJson(json.global, model._attributes);

        if (json.borders) {
            model._borders = BorderSet._fromJson(json.borders, model);
        }
        model._root = RowNode._fromJson(json.layout, model);
        model._tidy(); // initial tidy of node tree
        return model;
    }
    /** @internal */
    private static _attributeDefinitions: AttributeDefinitions = Model._createAttributeDefinitions();

    /** @internal */
    private static _createAttributeDefinitions(): AttributeDefinitions {
        const attributeDefinitions = new AttributeDefinitions();

        attributeDefinitions.add("legacyOverflowMenu", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("enableEdgeDock", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("rootOrientationVertical", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("marginInsets", { top: 0, right: 0, bottom: 0, left: 0 })
            .setType("IInsets");
        attributeDefinitions.add("enableUseVisibility", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("enableRotateBorderIcons", true).setType(Attribute.BOOLEAN);

        // splitter
        attributeDefinitions.add("splitterSize", -1).setType(Attribute.NUMBER);
        attributeDefinitions.add("splitterExtra", 0).setType(Attribute.NUMBER);

        // tab
        attributeDefinitions.add("tabEnableClose", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabCloseType", 1).setType("ICloseType");
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
        attributeDefinitions.add("tabSetClassNameTabStrip", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("tabSetClassNameHeader", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("tabSetEnableTabStrip", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabSetHeaderHeight", 0).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabSetTabStripHeight", 0).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabSetMarginInsets", { top: 0, right: 0, bottom: 0, left: 0 })
            .setType("IInsets");
        attributeDefinitions.add("tabSetBorderInsets", { top: 0, right: 0, bottom: 0, left: 0 })
            .setType("IInsets");
        attributeDefinitions.add("tabSetTabLocation", "top").setType("ITabLocation");
        attributeDefinitions.add("tabSetMinWidth", 0).setType(Attribute.NUMBER);
        attributeDefinitions.add("tabSetMinHeight", 0).setType(Attribute.NUMBER);

        // border
        attributeDefinitions.add("borderSize", 200).setType(Attribute.NUMBER);
        attributeDefinitions.add("borderMinSize", 0).setType(Attribute.NUMBER);
        attributeDefinitions.add("borderBarSize", 0).setType(Attribute.NUMBER);
        attributeDefinitions.add("borderEnableDrop", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("borderAutoSelectTabWhenOpen", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("borderAutoSelectTabWhenClosed", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("borderClassName", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("borderEnableAutoHide", false).setType(Attribute.BOOLEAN);

        return attributeDefinitions;
    }

    /** @internal */
    private _attributes: Record<string, any>;
    /** @internal */
    private _idMap: Record<string, Node>;
    /** @internal */
    private _changeListener?: (action: Action) => void;
    /** @internal */
    private _root?: RowNode;
    /** @internal */
    private _borders: BorderSet;
    /** @internal */
    private _onAllowDrop?: (dragNode: Node, dropInfo: DropInfo) => boolean;
    /** @internal */
    private _maximizedTabSet?: TabSetNode;
    /** @internal */
    private _activeTabSet?: TabSetNode;
    /** @internal */
    private _borderRects: { inner: Rect; outer: Rect } = { inner: Rect.empty(), outer: Rect.empty() };
    /** @internal */
    private _pointerFine: boolean;
    /** @internal */
    private _onCreateTabSet?: (tabNode?: TabNode) => ITabSetAttributes;
    /** @internal */
    private _showHiddenBorder: DockLocation;


    /**
     * 'private' constructor. Use the static method Model.fromJson(json) to create a model
     *  @internal
     */

    private constructor() {
        this._attributes = {};
        this._idMap = {};
        this._borders = new BorderSet(this);
        this._pointerFine = true;
        this._showHiddenBorder = DockLocation.CENTER;
    }

    /** @internal */
    _setChangeListener(listener: ((action: Action) => void) | undefined) {
        this._changeListener = listener;
    }

    /**
     * Get the currently active tabset node
     */
    getActiveTabset() {
        if (this._activeTabSet && this.getNodeById(this._activeTabSet.getId())) {
            return this._activeTabSet;
        } else {
            return undefined;
        }
    }

    /** @internal */
    _getShowHiddenBorder() {
        return this._showHiddenBorder;
    }

    /** @internal */
    _setShowHiddenBorder(location: DockLocation) {
        this._showHiddenBorder = location;
    }

    /** @internal */
    _setActiveTabset(tabsetNode: TabSetNode | undefined) {
        this._activeTabSet = tabsetNode;
    }

    /**
     * Get the currently maximized tabset node
     */
    getMaximizedTabset() {
        return this._maximizedTabSet;
    }

    /** @internal */
    _setMaximizedTabset(tabsetNode: (TabSetNode | undefined)) {
        this._maximizedTabSet = tabsetNode;
    }

    /**
     * Gets the root RowNode of the model
     * @returns {RowNode}
     */
    getRoot() {
        return this._root as RowNode;
    }

    isRootOrientationVertical() {
        return this._attributes.rootOrientationVertical as boolean;
    }

    isUseVisibility() {
        return this._attributes.enableUseVisibility as boolean;
    }

    isEnableRotateBorderIcons() {
        return this._attributes.enableRotateBorderIcons as boolean;
    }

    /**
     * Gets the
     * @returns {BorderSet|*}
     */
    getBorderSet() {
        return this._borders;
    }

    /** @internal */
    _getOuterInnerRects() {
        return this._borderRects;
    }

    /** @internal */
    _getPointerFine() {
        return this._pointerFine;
    }

    /** @internal */
    _setPointerFine(pointerFine: boolean) {
        this._pointerFine = pointerFine;
    }

    /**
     * Visits all the nodes in the model and calls the given function for each
     * @param fn a function that takes visited node and a integer level as parameters
     */
    visitNodes(fn: (node: Node, level: number) => void) {
        this._borders._forEachNode(fn);
        (this._root as RowNode)._forEachNode(fn, 0);
    }

    /**
     * Gets a node by its id
     * @param id the id to find
     */
    getNodeById(id: string): Node | undefined {
        return this._idMap[id];
    }

    /**
     * Finds the first/top left tab set of the given node.
     * @param node The top node you want to begin searching from, deafults to the root node
     * @returns The first Tab Set
     */
    getFirstTabSet(node = this._root as Node): Node
    {
        const child = node.getChildren()[0];
        if (child instanceof TabSetNode)
        {
            return child;
        }
        else
        {
            return this.getFirstTabSet(child);
        }
    }

    /**
     * Update the node tree by performing the given action,
     * Actions should be generated via static methods on the Actions class
     * @param action the action to perform
     * @returns added Node for Actions.addNode; undefined otherwise
     */
    doAction(action: Action): Node | undefined {
        let returnVal = undefined;
        // console.log(action);
        switch (action.type) {
            case Actions.ADD_NODE: {
                const newNode = new TabNode(this, action.data.json, true);
                const toNode = this._idMap[action.data.toNode] as Node & IDraggable;
                if (toNode instanceof TabSetNode || toNode instanceof BorderNode || toNode instanceof RowNode) {
                    toNode.drop(newNode, DockLocation.getByName(action.data.location), action.data.index, action.data.select);
                    returnVal = newNode;
                }
                break;
            }
            case Actions.MOVE_NODE: {
                const fromNode = this._idMap[action.data.fromNode] as Node & IDraggable;
                if (fromNode instanceof TabNode || fromNode instanceof TabSetNode) {
                    const toNode = this._idMap[action.data.toNode] as Node & IDropTarget;
                    if (toNode instanceof TabSetNode || toNode instanceof BorderNode || toNode instanceof RowNode) {
                        toNode.drop(fromNode, DockLocation.getByName(action.data.location), action.data.index, action.data.select);
                    }
                }
                break;
            }
            case Actions.DELETE_TAB: {
                const node = this._idMap[action.data.node];
                if (node instanceof TabNode) {
                    node._delete();
                }
                break;
            }
            case Actions.DELETE_TABSET: {
                const node = this._idMap[action.data.node];

                if (node instanceof TabSetNode) {
                    // first delete all child tabs that are closeable
                    const children = [...node.getChildren()];
                    for (let i = 0; i < children.length; i++) {
                        const child = children[i];
                        if ((child as TabNode).isEnableClose()) {
                            (child as TabNode)._delete();
                        }
                    }

                    if (node.getChildren().length === 0) {
                        node._delete();
                    }
                    this._tidy();
                }
                break;
            }
            case Actions.FLOAT_TAB: {
                const node = this._idMap[action.data.node];
                if (node instanceof TabNode) {
                    node._setFloating(true);
                    adjustSelectedIndexAfterFloat(node);
                }
                break;
            }
            case Actions.UNFLOAT_TAB: {
                const node = this._idMap[action.data.node];
                if (node instanceof TabNode) {
                    node._setFloating(false);
                    adjustSelectedIndexAfterDock(node);
                }
                break;
            }
            case Actions.RENAME_TAB: {
                const node = this._idMap[action.data.node];
                if (node instanceof TabNode) {
                    node._setName(action.data.text);
                }
                break;
            }
            case Actions.SELECT_TAB: {
                const tabNode = this._idMap[action.data.tabNode];
                if (tabNode instanceof TabNode) {
                    const parent = tabNode.getParent() as Node;
                    const pos = parent.getChildren().indexOf(tabNode);

                    if (parent instanceof BorderNode) {
                        if (parent.getSelected() === pos) {
                            parent._setSelected(-1);
                        } else {
                            parent._setSelected(pos);
                        }
                    } else if (parent instanceof TabSetNode) {
                        if (parent.getSelected() !== pos) {
                            parent._setSelected(pos);
                        }
                        this._activeTabSet = parent;
                    }
                }
                break;
            }
            case Actions.SET_ACTIVE_TABSET: {
                if (action.data.tabsetNode === undefined) {
                    this._activeTabSet = undefined;
                } else {
                    const tabsetNode = this._idMap[action.data.tabsetNode];
                    if (tabsetNode instanceof TabSetNode) {
                        this._activeTabSet = tabsetNode;
                    }
                }
                break;
            }
            case Actions.ADJUST_SPLIT: {
                const node1 = this._idMap[action.data.node1];
                const node2 = this._idMap[action.data.node2];

                if ((node1 instanceof TabSetNode || node1 instanceof RowNode) && (node2 instanceof TabSetNode || node2 instanceof RowNode)) {
                    this._adjustSplitSide(node1, action.data.weight1, action.data.pixelWidth1);
                    this._adjustSplitSide(node2, action.data.weight2, action.data.pixelWidth2);
                }
                break;
            }
            case Actions.ADJUST_BORDER_SPLIT: {
                const node = this._idMap[action.data.node];
                if (node instanceof BorderNode) {
                    node._setSize(action.data.pos);
                }
                break;
            }
            case Actions.MAXIMIZE_TOGGLE: {
                const node = this._idMap[action.data.node];
                if (node instanceof TabSetNode) {
                    if (node === this._maximizedTabSet) {
                        this._maximizedTabSet = undefined;
                    } else {
                        this._maximizedTabSet = node;
                        this._activeTabSet = node;
                    }
                }

                break;
            }
            case Actions.UPDATE_MODEL_ATTRIBUTES: {
                this._updateAttrs(action.data.json);
                break;
            }

            case Actions.UPDATE_NODE_ATTRIBUTES: {
                const node = this._idMap[action.data.node];
                node._updateAttrs(action.data.json);
                break;
            }
            default:
                break;
        }

        this._updateIdMap();

        if (this._changeListener !== undefined) {
            this._changeListener(action);
        }

        return returnVal;
    }

    /** @internal */
    _updateIdMap() {
        // regenerate idMap to stop it building up
        this._idMap = {};
        this.visitNodes((node) => (this._idMap[node.getId()] = node));
        // console.log(JSON.stringify(Object.keys(this._idMap)));
    }

    /** @internal */
    _adjustSplitSide(node: TabSetNode | RowNode, weight: number, pixels: number) {
        node._setWeight(weight);
        if (node.getWidth() != null && node.getOrientation() === Orientation.VERT) {
            node._updateAttrs({ width: pixels });
        } else if (node.getHeight() != null && node.getOrientation() === Orientation.HORZ) {
            node._updateAttrs({ height: pixels });
        }
    }

    /**
     * Converts the model to a json object
     * @returns {IJsonModel} json object that represents this model
     */
    toJson(): IJsonModel {
        const global: any = {};
        Model._attributeDefinitions.toJson(global, this._attributes);

        // save state of nodes
        this.visitNodes((node) => {
            node._fireEvent("save", undefined);
        });

        return { global, borders: this._borders._toJson(), layout: (this._root as RowNode).toJson() };
    }

    getSplitterSize() {
        let splitterSize = this._attributes.splitterSize as number;
        if (splitterSize === -1) {
            // use defaults
            splitterSize = this._pointerFine ? 8 : 12; // larger for mobile
        }
        return splitterSize;
    }

    isLegacyOverflowMenu() {
        return this._attributes.legacyOverflowMenu as boolean;
    }

    getSplitterExtra() {
        return this._attributes.splitterExtra as number;
    }

    isEnableEdgeDock() {
        return this._attributes.enableEdgeDock as boolean;
    }

    /** @internal */
    _addNode(node: Node) {
        const id = node.getId();
        if (this._idMap[id] !== undefined) {
            throw new Error(`Error: each node must have a unique id, duplicate id:${node.getId()}`);
        }

        if (node.getType() !== "splitter") {
            this._idMap[id] = node;
        }
    }

    /** @internal */
    _layout(rect: Rect, metrics: ILayoutMetrics) {
        // let start = Date.now();
        this._borderRects = this._borders._layoutBorder({ outer: rect, inner: rect }, metrics);
        rect = this._borderRects.inner.removeInsets(this._getAttribute("marginInsets"));

        this._root?.calcMinSize();
        (this._root as RowNode)._layout(rect, metrics);
        // console.log("layout time: " + (Date.now() - start));
        return rect;
    }

    /** @internal */
    _findDropTargetNode(dragNode: Node & IDraggable, x: number, y: number) {
        let node = (this._root as RowNode)._findDropTargetNode(dragNode, x, y);
        if (node === undefined) {
            node = this._borders._findDropTargetNode(dragNode, x, y);
        }
        return node;
    }

    /** @internal */
    _tidy() {
        // console.log("before _tidy", this.toString());
        (this._root as RowNode)._tidy();
        // console.log("after _tidy", this.toString());
    }

    /** @internal */
    _updateAttrs(json: any) {
        Model._attributeDefinitions.update(json, this._attributes);
    }

    /** @internal */
    _nextUniqueId() {
        return '#' + randomUUID();
    }

    /** @internal */
    _getAttribute(name: string): any {
        return this._attributes[name];
    }

    /**
     * Sets a function to allow/deny dropping a node
     * @param onAllowDrop function that takes the drag node and DropInfo and returns true if the drop is allowed
     */
    setOnAllowDrop(onAllowDrop: (dragNode: Node, dropInfo: DropInfo) => boolean) {
        this._onAllowDrop = onAllowDrop;
    }

    /** @internal */
    _getOnAllowDrop() {
        return this._onAllowDrop;
    }

    /**
     * set callback called when a new TabSet is created.
     * The tabNode can be undefined if it's the auto created first tabset in the root row (when the last
     * tab is deleted, the root tabset can be recreated)
     * @param onCreateTabSet 
     */
    setOnCreateTabSet(onCreateTabSet: (tabNode?: TabNode) => ITabSetAttributes) {
        this._onCreateTabSet = onCreateTabSet;
    }

    /** @internal */
    _getOnCreateTabSet() {
        return this._onCreateTabSet;
    }

    static toTypescriptInterfaces() {
        console.log(Model._attributeDefinitions.toTypescriptInterface("Global", undefined));
        console.log(RowNode.getAttributeDefinitions().toTypescriptInterface("Row", Model._attributeDefinitions));
        console.log(TabSetNode.getAttributeDefinitions().toTypescriptInterface("TabSet", Model._attributeDefinitions));
        console.log(TabNode.getAttributeDefinitions().toTypescriptInterface("Tab", Model._attributeDefinitions));
        console.log(BorderNode.getAttributeDefinitions().toTypescriptInterface("Border", Model._attributeDefinitions));
    }

    toString() {
        return JSON.stringify(this.toJson());
    }
}

