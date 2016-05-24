import RowNode from "./RowNode.js";
import Actions from "./Actions.js";
import TabNode from "./TabNode.js";
import TabSetNode from "./TabSetNode.js";
import JsonConverter from "../JsonConverter.js";
import Rect from "../Rect.js";
import DockLocation from "../DockLocation.js";
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
    }

    setListener(listener) {
        this._listener = listener;
    }

    /**
     * Get the currently active tabset node
     * @returns {null|TabSetNode}
     */
    getActiveTabset() {
        let activeTabset = null;
        this.visitNodes((node) => {
            if (node.getType() === "tabset" && node.isActive()) {
                activeTabset = node;
            }
        });
        return activeTabset;
    }

    _clearActiveTabset() {
        this.visitNodes((node) => {
            if (node.getType() === "tabset") {
                node._active = false;
            }
        });
    }

    /**
     * Gets the root RowNode of the model
     * @returns {RowNode}
     */
    getRoot() {
        return this._root;
    }

    /**
     * Visits all the nodes in the model and calls the given function for each
     * @param fn a function that takes visited node and a integer level as parameters
     */
    visitNodes(fn) {
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

    doAction(action) {
        //console.log(action);
        switch (action.type) {
            case Actions.ADD_NODE:
            {
                let newNode = new TabNode(this, action.json);
                let toNode = this._idMap[action.toNode];
                toNode._drop(newNode, DockLocation.getByName(action.location), action.index);
                break;
            }
            case Actions.MOVE_NODE:
            {
                let fromNode = this._idMap[action.fromNode];
                let toNode = this._idMap[action.toNode];
                toNode._drop(fromNode, DockLocation.getByName(action.location), action.index);
                break;
            }
            case Actions.DELETE_TAB:
            {
                let node = this._idMap[action.node];
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
                let tabNode = this._idMap[action.tabNode];
                let parent = tabNode.getParent();
                let pos = parent.getChildren().indexOf(tabNode);

                if (parent.getSelected() !== pos) {
                    parent._setSelected(pos);
                }
                this._clearActiveTabset();
                parent._active = true;

                break;
            }
            case Actions.SET_ACTIVE_TABSET:
            {
                let tabsetNode = this._idMap[action.tabsetNode];
                this._clearActiveTabset();
                tabsetNode._active = true;
                break;
            }
            case Actions.ADJUST_SPLIT:
            {
                let node1 = this._idMap[action.node1];
                let node2 = this._idMap[action.node2];

                this._adjustSplitSide(node1, action.weight1, action.pixelWidth1);
                this._adjustSplitSide(node2, action.weight2, action.pixelWidth2);
                break;
            }
            case Actions.MAXIMIZE_TOGGLE:
            {
                let node = this._idMap[action.node];
                node._setMaximized(!node.isMaximized());
                this._clearActiveTabset();
                node._active = true;

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
        let json = {global: {}, layout: {}};
        jsonConverter.toJson(json.global, this);
        this._root._forEachNode((node)=>{node._fireEvent("save", null);});
        json.layout = this._root._toJson();
        return json;
    }

    /**
     * Loads the model from the given json object
     * @param json the json model to load
     * @returns {Model} a new Model object
     */
    static fromJson(json) {
        let model = new Model();
        jsonConverter.fromJson(json.global, model);

        model._root = RowNode._fromJson(json.layout, model);
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
        //let start = Date.now();
        this._root._layout(rect);
        //console.log("layout time: " + (Date.now() - start));
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
        let lines = [];
        this._root.toString(lines, "");
        return lines.join("\n");
    }
}

let jsonConverter = new JsonConverter();

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

export default Model;