import RowNode from "./RowNode.js";
import Actions from "./Actions.js";
import TabNode from "./TabNode.js";
import TabSetNode from "./TabSetNode.js";
import BorderSet from "./BorderSet.js";
import BorderNode from "./BorderNode.js";
import DockLocation from "../DockLocation.js";
import AttributeDefinitions from "../AttributeDefinitions.js";
import Attribute from "../Attribute";
import Orientation from "../Orientation.js";

/**
 * Class containing the Tree of Nodes used by the FlexLayout component
 */
class Model {
    /**
     * 'private' constructor. Use the static method Model.fromJson(json) to create a model
     */
    constructor() {
        this._attributes = {};
        this._idMap = {};
        this._nextId = 0;
        this._listener = null;
        this._root = null;
        this._borders = new BorderSet(this);
        this._onAllowDrop = null;
        this._maximizedTabSet = null;
        this._activeTabSet = null;
    }

    setListener(listener) {
        this._listener = listener;
    }

    /**
     * Sets a function to allow/deny dropping a node
     * @param onAllowDrop function that takes the drag node and DropInfo and returns true if the drop is allowed
     *
     * example function:
     *
     * allowDrop(dragNode, dropInfo) {
     *   let dropNode = dropInfo.node;
     *
     *   // prevent non-border tabs dropping into borders
     *   if (dropNode.getType() == "border" && (dragNode.getParent() == null || dragNode.getParent().getType() != "border"))
     *     return false;
     *
     *   // prevent border tabs dropping into main layout
     *   if (dropNode.getType() != "border" && (dragNode.getParent() != null && dragNode.getParent().getType() == "border"))
     *     return false;
     *
     *   return true;
     * }
     */
    setOnAllowDrop(onAllowDrop) {
        this._onAllowDrop = onAllowDrop;
    }

    /**
     * Get the currently active tabset node
     * @returns {null|TabSetNode}
     */
    getActiveTabset() {
        return this._activeTabSet;
    }

    _setActiveTabset(tabsetNode) {
        this._activeTabSet = tabsetNode;
    }

    /**
     * Get the currently maximized tabset node
     * @returns {null|TabSetNode}
     */
    getMaximizedTabset() {
        return this._maximizedTabSet;
    }

    _setMaximizedTabset(tabsetNode) {
        this._maximizedTabSet = tabsetNode;
    }

    /**
     * Gets the root RowNode of the model
     * @returns {RowNode}
     */
    getRoot() {
        return this._root;
    }

    /**
     * Gets the
     * @returns {BorderSet|*}
     */
    getBorderSet() {
        return this._borders;
    }

    _getOuterInnerRects() {
        return this._borderRects;
    }

    /**
     * Visits all the nodes in the model and calls the given function for each
     * @param fn a function that takes visited node and a integer level as parameters
     */
    visitNodes(fn) {
        this._borders._forEachNode(fn);
        this._root._forEachNode(fn, 0);
    }

    /**
     * Gets a node by its id
     * @param id the id to find
     * @returns {null|Node}
     */
    getNodeById(id) {
        return this._idMap[id];
    }


    ///**
    // * Update the json by performing the given action,
    // * Actions should be generated via static methods on the Actions class
    // * @param json the json to update
    // * @param action the action to perform
    // * @returns {*} a new json object with the action applied
    // */
    //static apply(action, json) {
    //    console.log(json, action);
    //
    //    let model = Model.fromJson(json);
    //    model.doAction(action);
    //    return model.toJson();
    //}

    /**
     * Update the node tree by performing the given action,
     * Actions should be generated via static methods on the Actions class
     * @param action the action to perform
     */
    doAction(action) {
        //console.log(action);
        switch (action.type) {
            case Actions.ADD_NODE:
            {
                const newNode = new TabNode(this, action.json);
                let toNode = this._idMap[action.toNode];
                toNode._drop(newNode, DockLocation.getByName(action.location), action.index);
                break;
            }
            case Actions.MOVE_NODE:
            {
                const fromNode = this._idMap[action.fromNode];
                let toNode = this._idMap[action.toNode];
                toNode._drop(fromNode, DockLocation.getByName(action.location), action.index);
                break;
            }
            case Actions.DELETE_TAB:
            {
                let node = this._idMap[action.node];
                delete this._idMap[action.node];
                node._delete();
                break;
            }
            case Actions.RENAME_TAB:
            {
                let node = this._idMap[action.node];
                node._setName(action.text);
                break;
            }
            case Actions.SELECT_TAB:
            {
                const tabNode = this._idMap[action.tabNode];
                const parent = tabNode.getParent();
                const pos = parent.getChildren().indexOf(tabNode);

                if (parent.getType() === BorderNode.TYPE) {
                    if (parent.getSelected() == pos) {
                        parent._setSelected(-1);
                    }
                    else {
                        parent._setSelected(pos);
                    }

                }
                else {
                    if (parent.getSelected() !== pos) {
                        parent._setSelected(pos);
                    }
                    this._activeTabSet = parent;
                }

                break;
            }
            case Actions.SET_ACTIVE_TABSET:
            {
                const tabsetNode = this._idMap[action.tabsetNode];
                this._activeTabSet = tabsetNode;
                break;
            }
            case Actions.ADJUST_SPLIT:
            {
                const node1 = this._idMap[action.node1];
                const node2 = this._idMap[action.node2];

                this._adjustSplitSide(node1, action.weight1, action.pixelWidth1);
                this._adjustSplitSide(node2, action.weight2, action.pixelWidth2);
                break;
            }
            case Actions.ADJUST_BORDER_SPLIT:
            {
                let node = this._idMap[action.node];
                node._setSize(action.pos);
                break;
            }
            case Actions.MAXIMIZE_TOGGLE:
            {
                let node = this._idMap[action.node];
                if (node === this._maximizedTabSet) {
                    this._maximizedTabSet = null;
                } else {
                    this._maximizedTabSet = node;
                    this._activeTabSet = node;
                }

                break;
            }
            case Actions.UPDATE_MODEL_ATTRIBUTES:
            {
                this._updateAttrs(action.json);
                break;
            }
            case Actions.UPDATE_NODE_ATTRIBUTES:
            {
                let node = this._idMap[action.node];
                node._updateAttrs(action.json);
                break;
            }
        }

        this._updateIdMap();

        if (this._listener !== null) {
            this._listener();
        }
    }

    _updateIdMap() {
        // regenerate idMap to stop it building up
        this._idMap = {};
        this.visitNodes((node) => this._idMap[node.getId()] = node);
        //console.log(JSON.stringify(Object.keys(this._idMap)));
    }

    _adjustSplitSide(node, weight, pixels) {
        node._setWeight(weight);
        if (node.getWidth() != null && node.getOrientation() === Orientation.VERT) {
            node._updateAttrs({width:pixels});
        }
        else if (node.getHeight() != null && node.getOrientation() === Orientation.HORZ) {
            node._updateAttrs({height:pixels});
        }
    }

    /**
     * Converts the model to a json object
     * @returns {*} json object that represents this model
     */
    toJson() {
        const json = {global: {}, layout: {}};
        attributeDefinitions.toJson(json.global, this._attributes);

        // save state of nodes
        this.visitNodes((node)=> {
            node._fireEvent("save", null);
        });

        json.borders = this._borders._toJson();
        json.layout = this._root._toJson();
        return json;
    }

    /**
     * Loads the model from the given json object
     * @param json the json model to load
     * @returns {Model} a new Model object
     */
    static fromJson(json) {
        const model = new Model();
        attributeDefinitions.fromJson(json.global, model._attributes);

        if (json.borders) {
            model._borders = BorderSet._fromJson(json.borders, model);
        }
        model._root = RowNode._fromJson(json.layout, model);
        model._tidy(); // initial tidy of node tree
        return model;
    }

    getSplitterSize() {
        return this._attributes["splitterSize"];
    }

    isEnableEdgeDock() {
        return this._attributes["enableEdgeDock"];
    }

    _addNode(node) {
        if (node.getId() == null) {
            node._setId(this._nextUniqueId());
        }
        else {
            if (this._idMap[node.getId()] !== undefined) {
                throw "Error: each node must have a unique id, duplicate id: " + node.getId();
            }

        }

        if (node.getType() !== "splitter") {
            this._idMap[node.getId()] = node;
        }
    }

    _layout(rect) {
        //let start = Date.now();
        this._borderRects = this._borders._layout({outer: rect, inner: rect});
        this._root._layout(this._borderRects.inner);
        return this._borderRects.inner;
        //console.log("layout time: " + (Date.now() - start));
    }

    _findDropTargetNode(dragNode, x, y) {
        let node = this._root._findDropTargetNode(dragNode, x, y);
        if (node == null) {
            node = this._borders._findDropTargetNode(dragNode, x, y);
        }
        return node;
    }

    _tidy() {
        //console.log("before _tidy", this.toString());
        this._root._tidy();
        //console.log("after _tidy", this.toString());
    }

    _updateAttrs(json) {
        attributeDefinitions.update(json, this._attributes);
    }

    _nextUniqueId() {
        this._nextId++;
        while (this._idMap["#" + this._nextId] !== undefined) {
            this._nextId++;
        }

        return "#" + this._nextId;
    }

    toString() {
        return JSON.stringify(this.toJson());
    }
}

let attributeDefinitions = new AttributeDefinitions();

// splitter
attributeDefinitions.add("splitterSize", 8).setType(Attribute.INT).setFrom(1);
attributeDefinitions.add("enableEdgeDock", true).setType(Attribute.BOOLEAN);

// tab
attributeDefinitions.add("tabEnableClose", true).setType(Attribute.BOOLEAN);
attributeDefinitions.add("tabEnableDrag", true).setType(Attribute.BOOLEAN);
attributeDefinitions.add("tabEnableRename", true).setType(Attribute.BOOLEAN);
attributeDefinitions.add("tabClassName", null).setType(Attribute.STRING);
attributeDefinitions.add("tabIcon", null).setType(Attribute.STRING);
attributeDefinitions.add("tabRenderOnDemand", true).setType(Attribute.BOOLEAN);

// tabset
attributeDefinitions.add("tabSetEnableDeleteWhenEmpty", true).setType(Attribute.BOOLEAN);
attributeDefinitions.add("tabSetEnableClose", true).setType(Attribute.BOOLEAN);
attributeDefinitions.add("tabSetEnableDrop", true).setType(Attribute.BOOLEAN);
attributeDefinitions.add("tabSetEnableDrag", true).setType(Attribute.BOOLEAN);
attributeDefinitions.add("tabSetEnableDivide", true).setType(Attribute.BOOLEAN);
attributeDefinitions.add("tabSetEnableMaximize", true).setType(Attribute.BOOLEAN);
attributeDefinitions.add("tabSetClassNameTabStrip", null).setType(Attribute.STRING);
attributeDefinitions.add("tabSetClassNameHeader", null).setType(Attribute.STRING);
attributeDefinitions.add("tabSetEnableTabStrip", true).setType(Attribute.BOOLEAN);
attributeDefinitions.add("tabSetHeaderHeight", 20).setType(Attribute.INT).setFrom(0);
attributeDefinitions.add("tabSetTabStripHeight", 20).setType(Attribute.INT).setFrom(0);

attributeDefinitions.add("borderBarSize", 25);
attributeDefinitions.add("borderEnableDrop", true).setType(Attribute.BOOLEAN);
attributeDefinitions.add("borderClassName", null).setType(Attribute.STRING);

export default Model;