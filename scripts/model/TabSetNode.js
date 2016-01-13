import Rect from "../Rect.js";
import JsonConverter from "../JsonConverter.js";
import DockLocation from "../DockLocation.js";
import Orientation from "../Orientation.js";
import DragDrop from "../DragDrop.js";
import DropInfo from "./../DropInfo.js";
import Node from "./Node.js";
import TabNode from "./TabNode.js";
import RowNode from "./RowNode.js";

class TabSetNode extends Node
{
    constructor(model)
    {
        super(model);
        jsonConverter.setDefaults(this);

        this._contentRect = null;
        this._headerRect = null;
        this._tabHeaderRect = null;
    }

    getName()
    {
        return this._name;
    }

    getSelected()
    {
        return this._selected;
    }

    isMaximized()
    {
        return this._maximized;
    }

    isEnableClose()
    {
        return this._getAttr("_tabSetEnableClose");
    }

    isEnableDrop()
    {
        return this._getAttr("_tabSetEnableDrop");
    }

    isEnableDrag()
    {
        return this._getAttr("_tabSetEnableDrag");
    }

    isEnableDivide()
    {
        return this._getAttr("_tabSetEnableDivide");
    }

    isEnableMaximize()
    {
        return this._getAttr("_tabSetEnableMaximize");
    }

    isEnableTabStrip()
    {
        return this._getAttr("_tabSetEnableTabStrip");
    }

    getClassNameTabStrip()
    {
        return this._getAttr("_tabSetClassNameTabStrip");
    }

    getClassNameHeader()
    {
        return this._getAttr("_tabSetClassNameHeader");
    }

    getHeaderHeight()
    {
        return this._getAttr("_tabSetHeaderHeight");
    }

    getTabStripHeight()
    {
        return this._getAttr("_tabSetTabStripHeight");
    }

    _setSelected(index)
    {
        this._selected = index;
        this._model._fireChange();
    }

    _setMaximized(maximized)
    {
        this._maximized = maximized;
    }

    _canDockInto(dropNode, dropInfo)
    {
        // cannot drop to center if named tabset
        if (dropInfo!= null && dropInfo.location == DockLocation.CENTER && this._name != null)
        {
            return false;
        }
        return true;
    }

    _canDrop(dragNode, x, y)
    {
        var dropInfo = null;

        if (dragNode == this)
        {
            var dockLocation = DockLocation.CENTER;
            var outlineRect = this._tabHeaderRect;
            dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect");
        }
        else if ( this._contentRect.contains(x, y))
        {
            var dockLocation = DockLocation.getLocation(this._contentRect, x, y);
            var outlineRect = dockLocation.getDockRect(this._rect);
            dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect");
        }
        else if (this._children.length > 0 && this._tabHeaderRect != null && this._tabHeaderRect.contains(x, y))
        {
            var p = this._tabHeaderRect.x;
            var y = this._children[0]._tabRect.y;
            var h = this._children[0]._tabRect.height;
            var w = this._children[0]._tabRect.width;
            var childCenter = 0;
            for (var i = 0; i < this._children.length; i++)
            {
                var child = this._children[i];
                w = this._children[0]._tabRect.width;
                childCenter = child._tabRect.x + child._tabRect.width / 2;
                if (x >= p && x < childCenter)
                {
                    var dockLocation = DockLocation.CENTER;
                    var outlineRect = new Rect(p, y, childCenter - p, h);
                    dropInfo = new DropInfo(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
                    break;
                }
                p = childCenter;
            }
            if (dropInfo == null)
            {
                var dockLocation = DockLocation.CENTER;
                var outlineRect = new Rect(p, y, w, h);
                dropInfo = new DropInfo(this, outlineRect, dockLocation, this._children.length, "flexlayout__outline_rect");
            }
        }

        if (!dragNode._canDockInto(this, dropInfo))
        {
            return null;
        }

        if (dropInfo!= null && dropInfo.location == DockLocation.CENTER && this.isEnableDrop() == false)
        {
            return null;
        }

        if (dropInfo!= null && dropInfo.location != DockLocation.CENTER && this.isEnableDivide() == false)
        {
            return null;
        }

        return dropInfo;
    }

    _layout(rect)
    {

        if (this._maximized)
        {
            rect = this._model._root._rect;
        }
        this._rect = rect;

        var showHeader = (this._name != null);
        var y = 0;
        if (showHeader)
        {
            this._headerRect = new Rect(rect.x, rect.y, rect.width, 20);
            y += this.getHeaderHeight();
        }
        if (this.isEnableTabStrip()) {
            this._tabHeaderRect = new Rect(rect.x, rect.y + y, rect.width, 20);
            y += this.getTabStripHeight();
        }
        this._contentRect = new Rect(rect.x, rect.y + y, rect.width, rect.height - y);

        for (var i = 0; i < this._children.length; i++)
        {
            var child = this._children[i];
            child._layout(this._contentRect);
            child._setVisible(i == this._selected);
        }
    }

    _remove(node)
    {
        this._removeChild(node);
        this._model._tidy();
		this._selected = Math.max(0, this._selected -1);
    }

    _drop(dragNode, location, index)
    {
        var dockLocation = location;

        if (this == dragNode) // tabset drop into itself
        {
            return; // dock back to itself
        }

		var fromIndex = 0;
		if (dragNode._parent != null)
		{
			 fromIndex = dragNode._parent._removeChild(dragNode);
		}
        //console.log("removed child: " + fromIndex);

        // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
        if (dragNode._type === TabNode.TYPE && dragNode._parent == this && fromIndex < index && index > 0)
        {
            index--;
        }

        // for the tabset being removed from set the selected index to 0
        if (dragNode._parent !== null && dragNode._parent._type === TabSetNode.TYPE)
        {
            dragNode._parent._selected = 0;
        }

        // simple dock to existing tabset
        if (dockLocation == DockLocation.CENTER)
        {
            var insertPos = index;
            if (insertPos == -1)
            {
                insertPos = this._children.length;
            }

            if (dragNode._type === TabNode.TYPE)
            {
                this._addChild(dragNode, insertPos);
                this._selected = insertPos;
                //console.log("added child at : " + insertPos);
            }
            else
            {
                for (var i = 0; i < dragNode._children.length; i++)
                {
                    this._addChild(dragNode._children[i], insertPos);
                    //console.log("added child at : " + insertPos);
                    insertPos++;
                }
            }
            this._model._activeTabSet = this;

        }
        else
        {
            var tabSet = null;
            if (dragNode._type === TabNode.TYPE)
            {
                // create new tabset parent
                //console.log("create a new tabset");
                tabSet = new TabSetNode(this._model);
                tabSet._addChild(dragNode);
                //console.log("added child at end");
                dragNode._parent = tabSet;
            }
            else
            {
                tabSet = dragNode;
            }

            var parentRow = this._parent;
            var pos = parentRow._children.indexOf(this);

            if (parentRow._orientation == dockLocation._orientation)
            {
                tabSet._weight = this._weight / 2;
                this._weight = this._weight / 2;
                //console.log("added child 50% size at: " +  pos + dockLocation.indexPlus);
                parentRow._addChild(tabSet, pos + dockLocation._indexPlus);
            }
            else
            {
                // create a new row to host the new tabset (it will go in the opposite direction)
                //console.log("create a new row");
                var newRow = new RowNode(this._model);
                newRow._weight = this._weight;
                newRow._addChild(this);
                this._weight = 50;
                tabSet._weight = 50;
                //console.log("added child 50% size at: " +  dockLocation.indexPlus);
                newRow._addChild(tabSet, dockLocation._indexPlus);

                parentRow._removeChild(this);
                parentRow._addChild(newRow, pos);
            }
            this._model._activeTabSet = tabSet;

        }
        this._model._tidy();

    }

    _toJson()
    {
        var json = {};
        jsonConverter.toJson(json, this);
        json.children = [];
        for (var i=0;i<this._children.length; i++)
        {
            var jsonChild = this._children[i]._toJson();
            json.children.push(jsonChild);
        }
        return json;
    }

    static _fromJson(json, model)
    {
        var newLayoutNode = new TabSetNode(model);

        jsonConverter.fromJson(json, newLayoutNode);

        if (json.children != undefined)
        {
            for (var i = 0; i < json.children.length; i++)
            {
                var child = TabNode._fromJson(json.children[i], model);
                newLayoutNode._addChild(child);
            }
        }

        return newLayoutNode;
    }
}

TabSetNode.TYPE = "tabset";

var jsonConverter = new JsonConverter();
jsonConverter.addConversion("_type", "type", TabSetNode.TYPE, true);
jsonConverter.addConversion("_weight", "weight", 100);
jsonConverter.addConversion("_width", "width", null);
jsonConverter.addConversion("_height", "height", null);
jsonConverter.addConversion("_name", "name", null);
jsonConverter.addConversion("_selected", "selected", 0);
jsonConverter.addConversion("_maximized", "maximized", false);
jsonConverter.addConversion("_id", "id", null);

jsonConverter.addConversion("_tabSetEnableClose", "enableClose", undefined);
jsonConverter.addConversion("_tabSetEnableDrop", "enableDrop", undefined);
jsonConverter.addConversion("_tabSetEnableDrag", "enableDrag", undefined);
jsonConverter.addConversion("_tabSetEnableDivide", "enableDivide", undefined);
jsonConverter.addConversion("_tabSetEnableMaximize", "enableMaximize", undefined);
jsonConverter.addConversion("_tabSetClassNameTabStrip", "classNameTabStrip", undefined);
jsonConverter.addConversion("_tabSetClassNameHeader", "classNameHeader", undefined);
jsonConverter.addConversion("_tabSetEnableTabStrip", "enableTabStrip", undefined);

jsonConverter.addConversion("_tabSetHeaderHeight", "headerHeight", undefined);
jsonConverter.addConversion("_tabSetTabStripHeight", "tabStripHeight", undefined);


export default TabSetNode;