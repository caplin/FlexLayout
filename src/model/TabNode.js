import Node from "./Node.js";
import AttributeDefinitions from "../AttributeDefinitions.js";
import DockLocation from "../DockLocation.js";
import TabSetNode from "./TabSetNode.js";
import RowNode from "./RowNode.js";

class TabNode extends Node {

    constructor(model, json) {
        super(model);

        this._tabRect = null; // rect of the tab rather than the tab contents=
        this._extra = {};  // extra data added to node not saved in json

        attributeDefinitions.fromJson(json, this._attributes);
        model._addNode(this);
    }

    getTabRect() {
        return this._tabRect;
    }

    setTabRect(rect) {
        this._tabRect = rect;
    }

    getName() {
        return this._attributes["name"];
    }

    getComponent() {
        return this._attributes["component"];
    }

    getConfig() {
        return this._attributes["config"];
    }

    getExtraData() {
        return this._extra;
    }

    getIcon() {
        return this._attributes["icon"];
    }

    isEnableClose() {
        return this._getAttr("enableClose");
    }

    isEnableDrag() {
        return this._getAttr("enableDrag");
    }

    isEnableRename() {
        return this._getAttr("enableRename");
    }

    getClassName() {
        return this._getAttr("className");
    }

    _setName(name) {
        this._attributes["name"] = name;
    }

    _layout(rect) {
        if (!rect.equals(this._rect)) {
            this._fireEvent("resize", {rect: rect});
        }
        this._rect = rect;
    }

    _delete() {
        this._parent._remove(this);
        this._fireEvent("close", {});
    }

    static _fromJson(json, model) {
        const newLayoutNode = new TabNode(model, json);
        return newLayoutNode;
    }

    _toJson() {
        const json = {};
        attributeDefinitions.toJson(json, this._attributes);
        return json;
    }

    _updateAttrs(json) {
        attributeDefinitions.update(json, this._attributes);
    }

    _getAttributeDefinitions() {
        return attributeDefinitions;
    }
}

TabNode.TYPE = "tab";

let attributeDefinitions = new AttributeDefinitions();
attributeDefinitions.add("type", TabNode.TYPE, true);
attributeDefinitions.add("id", null);

attributeDefinitions.add("name", null);
attributeDefinitions.add("component", null);
attributeDefinitions.add("config", null);

attributeDefinitions.addInherited("enableClose", "tabEnableClose");
attributeDefinitions.addInherited("enableDrag", "tabEnableDrag");
attributeDefinitions.addInherited("enableRename", "tabEnableRename");
attributeDefinitions.addInherited("className", "tabClassName");
attributeDefinitions.addInherited("icon", "tabIcon");

export default TabNode;