import Node from "./Node.js";
import JsonConverter from "../JsonConverter.js";
import DockLocation from "../DockLocation.js";
import TabSetNode from "./TabSetNode.js";
import RowNode from "./RowNode.js";

class TabNode extends Node
{
    constructor(model)
    {
        super(model);
        jsonConverter.setDefaults(this);

        this._tabRect = null; // rect of the tab rather than the tab contents=
        this._extra = {};  // extra data added to node not saved in json
    }

    getTabRect()
    {
        return this._tabRect;
    }

    setTabRect(rect)
    {
        this._tabRect = rect;
    }

    getName()
    {
        return this._name;
    }

    getComponent()
    {
        return this._component;
    }

    getExtraData()
    {
        return this._extra;
    }

    getConfig()
    {
        return this._config;
    }

    getIcon()
    {
        return this._getAttr("_tabIcon");
    }

    isEnableClose()
    {
        return this._getAttr("_tabEnableClose");
    }

    isEnableDrag()
    {
        return this._getAttr("_tabEnableDrag");
    }

    isEnableRename()
    {
        return this._getAttr("_tabEnableRename");
    }

    getClassName()
    {
        return this._getAttr("_tabClassName");
    }

    static _create(model, json)
    {
        var node = TabNode._fromJson(json,model);
        model._addNode(node);
        return node;
    }

    _setName(name)
    {
        this._name = name;
    }

	_layout(rect)
	{
		if ( !rect.equals(this._rect))
		{
			this._fireEvent("resize", {rect:rect});
		}
		this._rect = rect;
	}

    _delete()
    {
        this._parent._remove(this);
        this._fireEvent("close", {});
    }

    static _fromJson(json, model)
    {
        var newLayoutNode = new TabNode(model);
        jsonConverter.fromJson(json, newLayoutNode);
        return newLayoutNode;
    }

    _toJson()
    {
        var json = {};
        jsonConverter.toJson(json, this);
        return json;
    }

    _updateAttrs(json)
    {
        jsonConverter.updateAttrs(json, this);
    }

    toString(lines, indent)
    {
        lines.push(indent + this._type + " " + this._name);
    }
}

TabNode.TYPE = "tab";

var jsonConverter = new JsonConverter();
jsonConverter.addConversion("_type", "type", TabNode.TYPE, true);
jsonConverter.addConversion("_name", "name", null);
jsonConverter.addConversion("_component", "component", null);
jsonConverter.addConversion("_config", "config", null);
jsonConverter.addConversion("_id", "id", null);

jsonConverter.addConversion("_tabEnableClose", "enableClose",undefined);
jsonConverter.addConversion("_tabEnableDrag", "enableDrag", undefined);
jsonConverter.addConversion("_tabEnableRename", "enableRename", undefined);
jsonConverter.addConversion("_tabClassName", "className", undefined);
jsonConverter.addConversion("_tabIcon", "icon", undefined);
console.log(jsonConverter.toTable());

export default TabNode;