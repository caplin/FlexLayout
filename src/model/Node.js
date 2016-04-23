import Rect from "../Rect.js";
import Orientation from "../Orientation.js";
import DockLocation from "../DockLocation.js";

var NextKey = 0;

class Node {
    constructor(model)
    {
        this._type = null;
        this._model = model;
        this._parent = null;
        this._children = [];
        this._weight = 100;
        this._height = null;
        this._width = null;
        this._fixed = false;
        this._rect = new Rect();
        this._key = NextKey++;
        this._listeners = {};
        this._visible = false;
        this._orientation = Orientation.HORZ;
        this._id = null;
    }

    getId()
    {
        return this._id;
    }

    getModel()
    {
        return this._model;
    }

    getType()
    {
        return this._type;
    }

    getParent()
    {
        return this._parent;
    }

    getChildren()
    {
        return this._children;
    }

    getRect()
    {
        return this._rect;
    }

    getKey()
    {
        return this._key;
    }

    isVisible()
    {
        return this._visible;
    }

    getOrientation()
    {
        return this._orientation;
    }

    // event can be: resize, visibility, maximize (on tabset), close
    setEventListener(event, callback)
    {
        this._listeners[event] = callback;
    }

    removeEventListener(event)
    {
        delete this._listeners[event];
    }

    getWidth()
    {
        return this._width;
    }

    getHeight()
    {
        return this._height;
    }

    _getAttr(name)
    {
        var val = undefined;
        if (this[name] === undefined)
        {
            val = this._model[name];
        }
        else
        {
            val = this[name];
        }

        //console.log(name + "=" + val);
        return val;
    }

    _forEachNode(fn, level)
    {
        fn(this, level);
        level++;
        this._children.forEach((node) =>
        {
            fn(node, level);
            node._forEachNode(fn, level);
        })
    }

    _getPrefSize(orientation)
    {
        var prefSize = this.getWidth();
        if (orientation == Orientation.VERT)
        {
            prefSize = this.getHeight();
        }
        return prefSize;
    }

    _setVisible(visible)
    {
        if (visible != this._visible)
        {
            this._fireEvent("visibility", {visible: visible});
            this._visible = visible;
        }
    }

    _getDrawChildren()
    {
        return this._children;
    }


    _fireEvent(event, params)
    {
        //console.log(this._type, " fireEvent " + event + " " + JSON.stringify(params));
        if (this._listeners[event] != null)
        {
            this._listeners[event](params);
        }
    }

    _layout(rect)
    {
        this._rect = rect;
    }

    _findDropTargetNode(dragNode, x, y)
    {
        var rtn = null;
        if (this._rect.contains(x, y))
        {
            rtn = this._canDrop(dragNode, x, y);
            if (rtn == null)
            {
                if (this._children.length !== 0)
                {
                    for (var i = 0; i < this._children.length; i++)
                    {
                        var child = this._children[i];
                        rtn = child._findDropTargetNode(dragNode, x, y);
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

    _canDrop(dragNode, x, y)
    {
        return null;
    }

    _canDockInto(dragNode, dropInfo)
    {
        if (dropInfo != null)
        {
            if (dropInfo.location == DockLocation.CENTER && dropInfo.node.isEnableDrop() == false)
            {
                return false;
            }

            // prevent named tabset docking into another tabset, since this would loose the header
            if (dropInfo.location == DockLocation.CENTER && dragNode._type == "tabset" && dragNode.getName() !== null)
            {
                return false;
            }

            if (dropInfo.location != DockLocation.CENTER && dropInfo.node.isEnableDivide() == false)
            {
                return false;
            }
        }
        return true;
    }

    _removeChild(childNode)
    {
        var pos = this._children.indexOf(childNode);
        if (pos != -1)
        {
            this._children.splice(pos, 1);
        }
        this._dirty = true;
        return pos;
    }

    _addChild(childNode, pos)
    {
        if (pos != undefined)
        {
            this._children.splice(pos, 0, childNode);
        }
        else
        {
            this._children.push(childNode);
            pos = this._children.length - 1;
        }
        childNode._parent = this;
        this._dirty = true;
        return pos;
    }

    _removeAll()
    {
        this._children = [];
        this._dirty = true;
    }

    _styleWithPosition(style)
    {
        if (style == undefined)
        {
            style = {};
        }
        return this._rect.styleWithPosition(style);
    }

    // implemented by subclasses
    _updateAttrs(json)
    {
    }

    toString(lines, indent)
    {
        lines.push(indent + this._type + " " + this._weight.toFixed(2));
        indent = indent + "\t";
        for (var i = 0; i < this._children.length; i++)
        {
            var child = this._children[i];
            child.toString(lines, indent);
        }
    }
}

export default Node;
