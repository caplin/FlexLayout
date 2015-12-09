import Rect from "../Rect.js";
import DockLocation from "../DockLocation.js";
import Orientation from "../Orientation.js";
import DragDrop from "../DragDrop.js";
import DropInfo from "./DropInfo.js";
import Node from "./Node.js";
import TabNode from "./TabNode.js";
import RowNode from "./RowNode.js";

class TabSetNode extends Node
{
    constructor(model)
    {
        super("tabset", model);
        this.selected = 0;
    }

    setSelected(index)
    {
        this.selected = index;
        this.model.fireChange();
    }

    toJson()
    {
        var json = {};
        json.type = this.type;
        json.size = this.size;
        json.selected = this.selected;
        json.children = [];
        for (var i=0;i<this.children.length; i++)
        {
            var jsonChild = this.children[i].toJson();
            json.children.push(jsonChild);
        }
        return json;
    }


    static fromJson(json, model)
    {
        var newLayoutNode = new TabSetNode(model);

        if (json.size != null)
        {
            newLayoutNode.size = json.size;
        }

        if (json.selected != null)
        {
            newLayoutNode.selected = json.selected;
        }

        if (json.children != undefined)
        {
            var selected = 0;
            for (var i = 0; i < json.children.length; i++)
            {
                var child = TabNode.fromJson(json.children[i], model);
                if (child.selected)
                {
                    selected = i;
                }
                child.parent = newLayoutNode;
                newLayoutNode.children.push(child);
            }
            newLayoutNode.children[selected].selected = true;
        }

        return newLayoutNode;
    }

    canDrop(dragNode, x, y)
    {
        if (dragNode == this)
        {
            var dockLocation = DockLocation.CENTER;
            var outlineRect = this.tabRect;
            return new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect");
        }
        if (this.contentRect.contains(x, y))
        {
            var dockLocation = DockLocation.getLocation(this.contentRect, x, y);
            var outlineRect = dockLocation.getDockRect(this.rect);
            return new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect");
        }
        else if (this.children.length > 0 && this.tabRect.contains(x, y))
        {
            var p = this.tabRect.x;
            var y = this.children[0].tabRect.y;
            var h = this.children[0].tabRect.height;
            var w = this.children[0].tabRect.width;
            var childCenter = 0;
            for (var i = 0; i < this.children.length; i++)
            {
                var child = this.children[i];
                w = this.children[0].tabRect.width;
                childCenter = child.tabRect.x + child.tabRect.width / 2;
                if (x >= p && x < childCenter)
                {
                    var dockLocation = DockLocation.CENTER;
                    var outlineRect = new Rect(p, y, childCenter - p, h);
                    return new DropInfo(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
                }
                p = childCenter;
            }
            var dockLocation = DockLocation.CENTER;
            var outlineRect = new Rect(p, y, w, h);
            return new DropInfo(this, outlineRect, dockLocation, this.children.length, "flexlayout__outline_rect");
        }
        return null;
    }

    layout(rect)
    {

        if (this.maximized)
        {
            rect = this.model.root.rect;
        }
        this.rect = rect;

        this.contentRect = new Rect(rect.x, rect.y + 20, rect.width, rect.height - 20);
        this.tabRect = new Rect(rect.x, rect.y, rect.width, 20);
        for (var i = 0; i < this.children.length; i++)
        {
            var child = this.children[i];
            child.layout(this.contentRect);
        }
    }

    remove(node)
    {
        this.removeChild(node);
        this.model.tidy();
        this.model.fireChange();
		this.selected = Math.max(0, this.selected -1);
    }

    drop(dropInfo, dragNode)
    {
        var dockLocation = dropInfo.location;
        var index = dropInfo.index;

        if (this == dragNode) // tabset drop into itself
        {
            return; // dock back to itself
        }

		var fromIndex = 0;
		if (dragNode.parent != null)
		{
			 fromIndex = dragNode.parent.removeChild(dragNode);
		}
        //console.log("removed child: " + fromIndex);

        // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
        if (dragNode.type == "tab" && dragNode.parent == this && fromIndex < index && index > 0)
        {
            index--;
        }

        // for the tabset being removed from set the selected index to 0
        if (dragNode.parent != null && dragNode.parent.type == "tabset")
        {
            dragNode.parent.selected = 0;
        }

        // simple dock to existing tabset
        if (dockLocation == DockLocation.CENTER)
        {
            var insertPos = index;
            if (insertPos == -1)
            {
                insertPos = this.children.length;
            }

            if (dragNode.type == "tab")
            {
                this.addChild(dragNode, insertPos);
                this.selected = insertPos;
                //console.log("added child at : " + insertPos);
            }
            else
            {
                for (var i = 0; i < dragNode.children.length; i++)
                {
                    this.addChild(dragNode.children[i], insertPos);
                    //console.log("added child at : " + insertPos);
                    insertPos++;
                }
            }
        }
        else
        {
            var tabSet = null;
            if (dragNode.type == "tab")
            {
                // create new tabset parent
                //console.log("create a new tabset");
                tabSet = new TabSetNode(this.model);
                tabSet.addChild(dragNode);
                //console.log("added child at end");
                dragNode.parent = tabSet;
            }
            else
            {
                tabSet = dragNode;
            }

            var parentRow = this.parent;
            var pos = parentRow.children.indexOf(this);

            if (parentRow.orientation == dockLocation.orientation)
            {
                tabSet.size = this.size / 2;
                this.size = this.size / 2;
                //console.log("added child 50% size at: " +  pos + dockLocation.indexPlus);
                parentRow.addChild(tabSet, pos + dockLocation.indexPlus);
            }
            else
            {
                // create a new row to host the new tabset (it will go in the opposite direction)
                //console.log("create a new row");
                var newRow = new RowNode(this.model);
                newRow.size = this.size;
                newRow.addChild(this);
                this.size = 50;
                tabSet.size = 50;
                //console.log("added child 50% size at: " +  dockLocation.indexPlus);
                newRow.addChild(tabSet, dockLocation.indexPlus);

                parentRow.removeChild(this);
                parentRow.addChild(newRow, pos);
            }
        }
        this.model.tidy();
        this.model.fireChange();
    }
}

export default TabSetNode;