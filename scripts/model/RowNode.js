import Rect from "../Rect.js";
import Orientation from "../Orientation.js";
import DockLocation from "../DockLocation.js";
import SplitterNode from "./SplitterNode.js";
import Node from "./Node.js";
import TabSetNode from "./TabSetNode.js";
import DropInfo from "./DropInfo.js";

class RowNode extends Node
{
    constructor(model)
    {
        super("row", model);
        this.dirty = true;
        this.drawChildren = [];
        this.orientation = Orientation.HORZ;
		this.splitterCache = [];
    }

    layout(rect)
    {
		super.layout(rect);

        var pixelSize = this.rect.width;
        if (this.orientation == Orientation.VERT)
        {
            pixelSize = this.rect.height;
        }

        var totalSize = 0;
        var fixedPixels = 0;
        var numVariable = 0;
        var drawChildren = this.getDrawChildren();

        for (var i = 0; i < drawChildren.length; i++)
        {
            var child = drawChildren[i];
            if (!child.fixed)
            {
                totalSize += child.size;
                numVariable++;
            }
            else
            {
                fixedPixels += child.size;
            }
        }

        var availablePixels = pixelSize - fixedPixels;

        // assign actual pixel sizes
        var totalSizeGiven = 0;
        var variableSize = 0;
        for (var i = 0; i < drawChildren.length; i++)
        {
            var child = drawChildren[i];
            if (!child.fixed)
            {
                child.tempsize = Math.floor(availablePixels * (child.size / totalSize));
                totalSizeGiven += child.tempsize;
                variableSize += child.tempsize;
            }
            else
            {
                child.tempsize = child.size;
                totalSizeGiven += child.tempsize;
            }
        }

        // adjust sizes to exactly fit
        if (variableSize > 0)
        {
            while (totalSizeGiven < pixelSize)
            {
                for (var i = 0; i < drawChildren.length; i++)
                {
                    var child = drawChildren[i];
                    if (!child.fixed && totalSizeGiven < pixelSize)
                    {
                        child.tempsize++;
                        totalSizeGiven++;
                    }
                }
            }
        }

        var childOrientation = Orientation.flip(this.orientation);

        // layout children
        var p = 0;
        for (var i = 0; i < drawChildren.length; i++)
        {
            var child = drawChildren[i];
            child.orientation = childOrientation;
            if (this.orientation == Orientation.HORZ)
            {
                child.layout(new Rect(this.rect.x + p, this.rect.y, child.tempsize, this.rect.height));
            }
            else
            {
                child.layout(new Rect(this.rect.x, this.rect.y + p, this.rect.width, child.tempsize));
            }
            p += child.tempsize;
        }

        return true;
    }

    getSplitterBounds(splitterNode)
    {
        var pBounds = [0, 0];
        var drawChildren = this.getDrawChildren();
        var p = drawChildren.indexOf(splitterNode);
        if (this.orientation == Orientation.HORZ)
        {
            pBounds[0] = drawChildren[p - 1].rect.x;
            pBounds[1] = drawChildren[p + 1].rect.getRight() - splitterNode.size;
        }
        else
        {
            pBounds[0] = drawChildren[p - 1].rect.y;
            pBounds[1] = drawChildren[p + 1].rect.getBottom() - splitterNode.size;
        }
        return pBounds;
    }

    adjustSplit(splitter, splitterPos)
    {
        var drawChildren = this.getDrawChildren();
        var p = drawChildren.indexOf(splitter);
        var pBounds = this.getSplitterBounds(splitter);

        var weightedLength = drawChildren[p - 1].size + drawChildren[p + 1].size;

        var pixelWidth1 = Math.max(0, splitterPos - pBounds[0]);
        var pixelWidth2 = Math.max(0, pBounds[1] - splitterPos);

        if (pixelWidth1 + pixelWidth2 > 0)
        {
            var weight1 = (pixelWidth1 * weightedLength) / (pixelWidth1 + pixelWidth2);
            var weight2 = (pixelWidth2 * weightedLength) / (pixelWidth1 + pixelWidth2);

            drawChildren[p - 1].size = weight1;
            drawChildren[p + 1].size = weight2;
        }
        this.model.fireChange();
    }

    getDrawChildren()
    {
        if (this.dirty)
        {
			this.drawChildren = [];
			var oldSplitters = [].concat(this.splitterCache);

            for (var i = 0; i < this.children.length; i++)
            {
                var child = this.children[i];
                if (i != 0)
                {
					var newSplitter = null;
					if (oldSplitters.length > 0)
					{
						newSplitter = oldSplitters.shift();
					}
					else
					{
						newSplitter = new SplitterNode(this.model);
						this.splitterCache.push(newSplitter);
					}
                    newSplitter.parent = this;
                    this.drawChildren.push(newSplitter);
                }
                this.drawChildren.push(child);
            }
            this.dirty = false;
        }

        return this.drawChildren;
    }

    tidy()
    {
        var i = 0;
        while (i < this.children.length)
        {
            var child = this.children[i];
            if (child.type == "row")
            {
                child.tidy();

                if (child.children.length == 0 )
                {
					this.removeChild(child);
                }
                else if (child.children.length == 1)
                {
                    // hoist child/children up to this level
                    var subchild = child.children[0];
                    this.removeChild(child);
                    if (subchild.type == "row")
                    {
                        var subChildrenTotal = 0;
                        for (var j = 0; j < subchild.children.length; j++)
                        {
                            var subsubChild = subchild.children[j];
                            subChildrenTotal += subsubChild.size;
                        }
                        for (var j = 0; j < subchild.children.length; j++)
                        {
                            var subsubChild = subchild.children[j];
                            subsubChild.size = child.size * subsubChild.size / subChildrenTotal;
                            this.addChild(subsubChild, i + j);
                        }
                    }
                    else
                    {
                        subchild.size = child.size;
                        this.addChild(subchild, i);
                    }
                }
                else
                {
                    i++;
                }
            }
            else if (child.type == "tabset" && child.children.length == 0)
            {
				if (!(this == this.model.root && this.children.length == 1))
				{
					this.removeChild(child);
				}
				else
				{
					i++;
				}
            }
            else
            {
                i++;
            }
        }
    }

    toJson()
    {
        var json = {};
        json.type = this.type;
        json.size = this.size;
        json.children = [];

		this.children.forEach((child) => {json.children.push(child.toJson())});

        return json;
    }

    static fromJson(json,model)
    {
        var newLayoutNode = new RowNode(model);

        if (json.size != null)
        {
            newLayoutNode.size = json.size;
        }

        if (json.children != undefined)
        {
            for (var i = 0; i < json.children.length; i++)
            {
                var jsonChild = json.children[i];
                if (jsonChild.type === "tabset")
                {
                    var child = TabSetNode.fromJson(jsonChild, model);
                    child.parent = newLayoutNode;
                    newLayoutNode.children.push(child);
                }
                else
                {
                    var child = RowNode.fromJson(jsonChild, model);
                    child.parent = newLayoutNode;
                    newLayoutNode.children.push(child);
                }
            }
        }

        return newLayoutNode;
    }

    canDrop(dragNode, x, y)
    {
        var w = this.rect.width;
        var h = this.rect.height;
        var margin = 10; // height of edge rect
        var half =  50; // half width of edge rect

        if (this.parent == null) // root row
        {
            if (x < this.rect.x+margin && (y>h/2-half && y<h/2+half))
            {
                var dockLocation = DockLocation.LEFT;
                var outlineRect = dockLocation.getDockRect(this.rect);
                outlineRect.width = outlineRect.width/2;
                return new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect_edge");
            }
            else if (x > this.rect.getRight()-margin && (y>h/2-half && y<h/2+half))
            {
                var dockLocation = DockLocation.RIGHT;
                var outlineRect = dockLocation.getDockRect(this.rect);
                outlineRect.width = outlineRect.width/2;
                outlineRect.x +=outlineRect.width;
                return new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect_edge");
            }
            else if (y < this.rect.y+margin && (x>w/2-half && x<w/2+half))
            {
                var dockLocation = DockLocation.TOP;
                var outlineRect = dockLocation.getDockRect(this.rect);
                outlineRect.height = outlineRect.height/2;
                return new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect_edge");
            }
            else if (y > this.rect.getBottom()-margin && (x>w/2-half && x<w/2+half))
            {
                var dockLocation = DockLocation.BOTTOM;
                var outlineRect = dockLocation.getDockRect(this.rect);
                outlineRect.height = outlineRect.height/2;
                outlineRect.y +=outlineRect.height;
                return new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect_edge");
            }
        }

        return null;
    }

    drop(dropInfo, dragNode)
    {
        var dockLocation = dropInfo.location;

		var fromIndex = 0;
		if (dragNode.parent)
		{
			fromIndex = dragNode.parent.removeChild(dragNode);
		}

        if (dragNode.parent != null && dragNode.parent.type == "tabset")
        {
            dragNode.parent.selected = 0;
        }

        var tabSet = null;
        if (dragNode.type == "tabset")
        {
            tabSet = dragNode;
        }
        else
        {
            tabSet = new TabSetNode(this.model);
            tabSet.addChild(dragNode);
        }

        var size = 0;
        for (var i=0; i<this.children.length; i++)
        {
            size += this.children[i].size;
        }

        tabSet.size = size/3;

        if (dockLocation == DockLocation.LEFT)
        {
            this.addChild(tabSet, 0);
        }
        else if (dockLocation == DockLocation.RIGHT)
        {
            this.addChild(tabSet);
        }
        else if (dockLocation == DockLocation.TOP)
        {
            var vrow = new RowNode(this.model);
            var hrow = new RowNode(this.model);
            hrow.size = 75;
            tabSet.size = 25;
            for (var i=0; i<this.children.length; i++)
            {
                hrow.addChild(this.children[i]);
            }
            this.removeAll();
            vrow.addChild(tabSet);
            vrow.addChild(hrow);
            this.addChild(vrow);
        }
        else if (dockLocation == DockLocation.BOTTOM)
        {
            var vrow = new RowNode(this.model);
            var hrow = new RowNode(this.model);
            hrow.size = 75;
            tabSet.size = 25;
            for (var i=0; i<this.children.length; i++)
            {
                hrow.addChild(this.children[i]);
            }
            this.removeAll();
            vrow.addChild(hrow);
            vrow.addChild(tabSet);
            this.addChild(vrow);
        }

        this.model.tidy();
        this.model.fireChange();
    }
}

export default RowNode;

