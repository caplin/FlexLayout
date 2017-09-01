import RowNode from "./RowNode.js";
import Actions from "./Actions.js";
import TabNode from "./TabNode.js";
import TabSetNode from "./TabSetNode.js";
import BorderSet from "./BorderSet.js";
import BorderNode from "./BorderNode.js";
import DockLocation from "../DockLocation.js";
import JsonConverter from "../JsonConverter.js";
import Rect from "../Rect.js";
import Orientation from "../Orientation.js";

/**
 * Class containing the Tree of Nodes used by the FlexLayout component
 */
class Model {
    /**
     * 'private' constructor. Use the static method Model.fromJson(json) to create a model
     */
    constructor() {
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
     *   var dropNode = dropInfo.node;
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
    //    var model = Model.fromJson(json);
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
                var toNode = this._idMap[action.toNode];
                toNode._drop(newNode, DockLocation.getByName(action.location), action.index);
                break;
            }
            case Actions.MOVE_NODE:
            {
                const fromNode = this._idMap[action.fromNode];
                var toNode = this._idMap[action.toNode];
                toNode._drop(fromNode, DockLocation.getByName(action.location), action.index);
                break;
            }
            case Actions.DELETE_TAB:
            {
                var node = this._idMap[action.node];
                delete this._idMap[action.node];
                node._delete();
                break;
            }
            case Actions.RENAME_TAB:
            {
                var node = this._idMap[action.node];
                node._setName(action.text);
                break;
            }
            case Actions.SELECT_TAB:
            {
                const tabNode = this._idMap[action.tabNode];
                const parent = tabNode.getParent();
                const pos = parent.getChildren().indexOf(tabNode);

                if (parent._type === BorderNode.TYPE) {
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
                var node = this._idMap[action.node];
                node._setSize(action.pos);
                break;
            }
            case Actions.MAXIMIZE_TOGGLE:
            {
                var node = this._idMap[action.node];
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
                var node = this._idMap[action.node];
                node._updateAttrs(action.json);
                break;
            }
        }

        if (this._listener !== null) {
            this._listener();
        }
    }

    _adjustSplitSide(node, weight, pixels) {
        node._weight = weight;
        if (node._width != null && node.getOrientation() === Orientation.VERT) {
            node._width = pixels;
        }
        else if (node._height != null && node.getOrientation() === Orientation.HORZ) {
            node._height = pixels;
        }
    }

    /**
     * Converts the model to a json object
     * @returns {*} json object that represents this model
     */
    toJson() {
        const json = {global: {}, layout: {}};
        jsonConverter.toJson(json.global, this);

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
        jsonConverter.fromJson(json.global, model);

        if (json.borders) {
            model._borders = BorderSet._fromJson(json.borders, model);
        }
        model._root = RowNode._fromJson(json.layout, model);
        model._tidy(); // initial tidy of node tree
        return model;
    }

    getSplitterSize() {
        return this._splitterSize;
    }

    isEnableEdgeDock() {
        return this._enableEdgeDock;
    }

    _addNode(node) {
        if (node._id == null) {
            node._id = this._nextUniqueId();
        }
        else {
            if (this._idMap[node._id] !== undefined) {
                throw "Error: each node must have a unique id, duplicate id: " + node._id;
            }

        }
        this._idMap[node._id] = node;
    }

    _layout(rect) {
        //var start = Date.now();
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
        jsonConverter.updateAttrs(json, this);
    }

    _nextUniqueId() {
        this._nextId++;
        while (this._idMap["#" + this._nextId] !== undefined) {
            this._nextId++;
        }

        return "#" + this._nextId;
    }

    _checkUniqueId(json) {
        //if (json.id == undefined)
        //{
        //	throw "Error: each node must have an id: " + JSON.stringify(json, null, "\t");
        //}
        //
        //if (this._idMap[json.id] !== undefined)
        //{
        //	throw "Error: each node must have a unique id, duplicate id: " + JSON.stringify(json, null, "\t");
        //}
    }

    toString() {
        const lines = [];
        this._root.toStringIndented(lines, "");
        return lines.join("\n");
    }
}

var jsonConverter = new JsonConverter();

// splitter
jsonConverter.addConversion("_splitterSize", "splitterSize", 8);
jsonConverter.addConversion("_enableEdgeDock", "enableEdgeDock", true);

// tab
jsonConverter.addConversion("_tabEnableClose", "tabEnableClose", true);
jsonConverter.addConversion("_tabEnableDrag", "tabEnableDrag", true);
jsonConverter.addConversion("_tabEnableRename", "tabEnableRename", true);
jsonConverter.addConversion("_tabClassName", "tabClassName", null);
jsonConverter.addConversion("_tabIcon", "tabIcon", null);

// tabset
jsonConverter.addConversion("_tabSetEnableClose", "tabSetEnableClose", true);
jsonConverter.addConversion("_tabSetEnableDrop", "tabSetEnableDrop", true);
jsonConverter.addConversion("_tabSetEnableDrag", "tabSetEnableDrag", true);
jsonConverter.addConversion("_tabSetEnableDivide", "tabSetEnableDivide", true);
jsonConverter.addConversion("_tabSetEnableMaximize", "tabSetEnableMaximize", true);
jsonConverter.addConversion("_tabSetClassNameTabStrip", "tabSetClassNameTabStrip", null);
jsonConverter.addConversion("_tabSetClassNameHeader", "tabSetClassNameHeader", null);
jsonConverter.addConversion("_tabSetEnableTabStrip", "tabSetEnableTabStrip", true);
jsonConverter.addConversion("_tabSetHeaderHeight", "tabSetHeaderHeight", 20);
jsonConverter.addConversion("_tabSetTabStripHeight", "tabSetTabStripHeight", 20);

jsonConverter.addConversion("_borderBarSize", "borderBarSize", 25);
jsonConverter.addConversion("_borderEnableDrop", "borderEnableDrop", true);
jsonConverter.addConversion("_borderClassName", "borderClassName", null);

export default Model;