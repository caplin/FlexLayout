import Rect from "../Rect.js";
import Orientation from "../Orientation.js";
import DockLocation from "../DockLocation.js";

var NextKey = 0;

class Node
{
    constructor(type, model)
    {
        this.type = type;
        this.model = model;
        this.parent = null;
        this.children = [];
        this.size = 100;
        this.fixed = false;
        this.rect = new Rect();
        this.key = NextKey++;
        this.listeners = {};
		this.visible = false;
    }

	// event can be: resize, visibility, maximize (on tabset), close
    setEventListener(event, callback)
    {
        this.listeners[event] = callback;
    }

    removeEventListener(event)
    {
        delete this.listeners[event];
    }

    fireEvent(event, params)
    {
		if (this.listeners[event] != null)
		{
			//console.log(this, " fireEvent " + event + " " + JSON.stringify(params));
			this.listeners[event](params);
		}
    }

	setVisible(visible)
	{
		if (visible != this.visible)
		{
			this.fireEvent("visibility", {visible: visible});
			this.visible = visible;
		}
	}

    getDrawChildren()
    {
        return this.children;
    }

    layout(rect)
    {
        this.rect = rect;
    }

    findDropTargetNode(dragNode, x, y)
    {
        var rtn = null;
        if (this.rect.contains(x, y))
        {
            rtn = this.canDrop(dragNode, x, y);
            if (rtn == null)
            {
                if (this.children.length !== 0)
                {
                    for (var i = 0; i < this.children.length; i++)
                    {
                        var child = this.children[i];
                        rtn = child.findDropTargetNode(dragNode,x, y);
                        if (rtn != null)
                        {
                            break;
                        }
                    }
                }
            }
        }

        return rtn;
    }

    canDrop(dragNode, x, y)
    {
        return null;
    }

    removeChild(childNode)
    {
        var pos = this.children.indexOf(childNode);
        if (pos != -1)
        {
            this.children.splice(pos, 1);
        }
        this.dirty = true;
        return pos;
    }

    addChild(childNode, pos)
    {
        if (pos != undefined)
        {
            this.children.splice(pos, 0, childNode);
        }
        else
        {
            this.children.push(childNode);
        }
        childNode.parent = this;
        this.dirty = true;
    }

    removeAll()
    {
        this.children = [];
        this.dirty = true;
    }

    styleWithPosition(style)
    {
        if (style == undefined)
        {
            style = {};
        }
        return this.rect.styleWithPosition(style);
    }

    toString(lines, indent)
    {
        lines.push(indent + this.type + " " + this.size.toFixed(2));
        indent = indent + "\t";
        for (var i = 0; i < this.children.length; i++)
        {
            var child = this.children[i];
            child.toString(lines, indent);
        }
    }
}

export default Node;
