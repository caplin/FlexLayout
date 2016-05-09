import Node from "./Node.js";
import JsonConverter from "../JsonConverter.js";
import DockLocation from "../DockLocation.js";
import TabSetNode from "./TabSetNode.js";
import RowNode from "./RowNode.js";

class TabNode extends Node {

    constructor(model, json) {
        super(model);

        this._tabRect = null; // rect of the tab rather than the tab contents=

        jsonConverter.fromJson(json, this);
        model._addNode(this);
    }

    getTabRect() {
        return this._tabRect;
    }

    setTabRect(rect) {
        this._tabRect = rect;
    }

    getName() {
        return this._name;
    }

    getComponent() {
        return this._component;
    }

    getConfig() {
        return this._config;
    }

    getIcon() {
        return this._getAttr("_tabIcon");
    }

    isEnableClose() {
        return this._getAttr("_tabEnableClose");
    }

    isEnableDrag() {
        return this._getAttr("_tabEnableDrag");
    }

    isEnableRename() {
        return this._getAttr("_tabEnableRename");
    }

    getClassName() {
        return this._getAttr("_tabClassName");
    }

    _setName(name) {
        this._name = name;
    }

    _delete() {
        this._parent._remove(this);
    }

    static _fromJson(json, model) {
        model._checkUniqueId(json);
        let newLayoutNode = new TabNode(model, json);
        return newLayoutNode;
    }

    _toJson() {
        let json = {};
        jsonConverter.toJson(json, this);
        return json;
    }

    _updateAttrs(json) {
        jsonConverter.updateAttrs(json, this);
    }

    toString(lines, indent) {
        lines.push(indent + this._type + " " + this._name + " " + this._id);
    }
}

TabNode.TYPE = "tab";

let jsonConverter = new JsonConverter();
jsonConverter.addConversion("_type", "type", TabNode.TYPE, true);
jsonConverter.addConversion("_name", "name", null);
jsonConverter.addConversion("_component", "component", null);
jsonConverter.addConversion("_config", "config", null);
jsonConverter.addConversion("_id", "id", null);

jsonConverter.addConversion("_tabEnableClose", "enableClose", undefined);
jsonConverter.addConversion("_tabEnableDrag", "enableDrag", undefined);
jsonConverter.addConversion("_tabEnableRename", "enableRename", undefined);
jsonConverter.addConversion("_tabClassName", "className", undefined);
jsonConverter.addConversion("_tabIcon", "icon", undefined);
//console.log(jsonConverter.toTable());

export default TabNode;