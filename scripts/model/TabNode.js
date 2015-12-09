import Node from "./Node.js";
import DockLocation from "../DockLocation.js";
import TabSetNode from "./TabSetNode.js";
import RowNode from "./RowNode.js";

class TabNode extends Node
{
    constructor(model)
    {
        super("tab", model);
        this.tabRect = null; // rect of the tab rather than the tab contents=
        this.name = "";
        this.component = "";
        this.config = {}; // config added to json model that will be saved to json
        this.extra = {};  // extra data added to node not saved in json
    }

	layout(rect)
	{
		if ( !rect.equals(this.rect))
		{
			this.fireEvent("resize", {rect:rect});
		}
		this.rect = rect;
	}

    static fromJson(json, model)
    {
        var newLayoutNode = new TabNode(model);

        if (json.name != null)
        {
            newLayoutNode.name = json.name;
        }

        if (json.component != null)
        {
            newLayoutNode.component = json.component;
        }

        if (json.config != null)
        {
            newLayoutNode.config = json.config;
        }

        if (json.extra != null)
        {
            newLayoutNode.attrs = json.extra;
        }

        return newLayoutNode;
    }

    toJson()
    {
        var json = {};
        json.type = this.type;
        json.name = this.name;
        json.component = this.component;
        if (this.config != null)
        {
            json.config = this.config;
        }
        return json;
    }

    delete()
    {
        this.parent.remove(this);
        this.fireEvent("close", {});
    }

    toString(lines, indent)
    {
        lines.push(indent + this.type + " " + this.name);
    }
}

export default TabNode;