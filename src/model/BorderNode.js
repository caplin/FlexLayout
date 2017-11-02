import Rect from "../Rect.js";
import AttributeDefinitions from "../AttributeDefinitions.js";
import Attribute from "../Attribute";
import DockLocation from "../DockLocation.js";
import Orientation from "../Orientation.js";
import DropInfo from "./../DropInfo.js";
import Node from "./Node.js";
import TabNode from "./TabNode.js";
import TabSetNode from "./TabSetNode.js";
import SplitterNode from "./SplitterNode.js";

class BorderNode extends Node {

    constructor(location, json, model) {
        super(model);

        this._contentRect = null;
        this._tabHeaderRect = null;
        this._location = location;
        this._drawChildren = [];
        this._attributes["id"] = "border_" + location.getName();
        this._attributes["splitterSize"] = typeof json.splitterSize !== "undefined" ? json.splitterSize : this._model.getSplitterSize();
        attributeDefinitions.fromJson(json, this._attributes);
        model._addNode(this);
    }

    getLocation() {
        return this._location;
    }

    getTabHeaderRect() {
        return this._tabHeaderRect;
    }

    getContentRect() {
        return this._contentRect;
    }

    isEnableDrop() {
        return this._getAttr("enableDrop");
    }

    getClassNameBorder() {
        return this._getAttr("className");
    }

    getBorderBarSize() {
        return this._getAttr("barSize");
    }

    getSize() {
        return this._attributes["size"];
    }

    getSelected() {
        return this._attributes["selected"];
    }

    getSelectedNode() {
        if (this.getSelected() != -1) {
            return this._children[this.getSelected()];
        }
        return null;
    }

    getOrientation() {
        return this._location.getOrientation();
    }

    getSplitterSize() {
      return this._attributes['splitterSize'];
    }

    isMaximized() {
        return false;
    }

    isShowing() {
        return this._attributes["show"];
    }

    _setSelected(index) {
        this._attributes["selected"] = index;
    }

    _setSize(pos) {
        this._attributes["size"] = pos;
    }

    _updateAttrs(json) {
        attributeDefinitions.update(json, this._attributes);
    }

    _getDrawChildren() {
        return this._drawChildren;
    }

    _setAdjustedSize(size) {
        this._adjustedSize = size;
    }

    _getAdjustedSize() {
        return this._adjustedSize;
    }

    _layout(borderRects) {
        this._drawChildren = [];
        const location = this._location;

        const split1 = location.split(borderRects.outer, this.getBorderBarSize()); // split border outer
        const split2 = location.split(borderRects.inner, this.getBorderBarSize()); // split border inner
        const split3 = location.split(split2.end, this._adjustedSize + this.getSplitterSize()); // split off tab contents
        const split4 = location.reflect().split(split3.start, this.getSplitterSize()); // split contents into content and splitter

        this._tabHeaderRect = split2.start;
        this._contentRect = split4.end;

        this._children.forEach((child, i)=> {
            child._layout(this._contentRect);
            child._setVisible(i === this.getSelected());
            this._drawChildren.push(child);
        });

        if (this.getSelected() == -1) {
            return {outer: split1.end, inner: split2.end};
        }
        else {
            const newSplitter = new SplitterNode(this._model);
            newSplitter._parent = this;
            newSplitter._rect = split4.start;
            this._drawChildren.push(newSplitter);

            return {outer: split1.end, inner: split3.end};
        }
    }

    _remove(node) {
        if (this.getSelected() != -1) {
            const selectedNode = this._children[this.getSelected()];
            if (node === selectedNode) {
                this._setSelected(-1);
                this._removeChild(node);
            }
            else {
                this._removeChild(node);
                for (let i = 0; i < this._children.length; i++) {
                    if (this._children[i] === selectedNode) {
                        this._setSelected(i);
                        break;
                    }
                }
            }
        }
        else {
            this._removeChild(node);
        }
    }

    _canDrop(dragNode, x, y) {
        if (dragNode.getType() != TabNode.TYPE) {
            return false;
        }

        let dropInfo = null;
        const dockLocation = DockLocation.CENTER;

        if (this._tabHeaderRect.contains(x, y)) {
            if (this._location._orientation == Orientation.VERT) {
                if (this._children.length > 0) {
                    let child = this._children[0];
                    let childRect = child._tabRect;
                    const childY = childRect.y;

                    const childHeight = childRect.height;

                    let pos = this._tabHeaderRect.x;
                    let childCenter = 0;
                    for (let i = 0; i < this._children.length; i++) {
                        child = this._children[i];
                        childRect = child._tabRect;
                        childCenter = childRect.x + childRect.width / 2;
                        if (x >= pos && x < childCenter) {
                            let outlineRect = new Rect(childRect.x - 2, childY, 3, childHeight);
                            dropInfo = new DropInfo(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
                            break;
                        }
                        pos = childCenter;
                    }
                    if (dropInfo == null) {
                        let outlineRect = new Rect(childRect.getRight() - 2, childY, 3, childHeight);
                        dropInfo = new DropInfo(this, outlineRect, dockLocation, this._children.length, "flexlayout__outline_rect");
                    }
                }
                else {
                    let outlineRect = new Rect(this._tabHeaderRect.x + 1, this._tabHeaderRect.y + 2, 3, 18);
                    dropInfo = new DropInfo(this, outlineRect, dockLocation, 0, "flexlayout__outline_rect");

                }
            }
            else {
                if (this._children.length > 0) {
                    let child = this._children[0];
                    let childRect = child._tabRect;
                    const childX = childRect.x;
                    const childWidth = childRect.width;

                    let pos = this._tabHeaderRect.y;
                    let childCenter = 0;
                    for (let i = 0; i < this._children.length; i++) {
                        child = this._children[i];
                        childRect = child._tabRect;
                        childCenter = childRect.y + childRect.height / 2;
                        if (y >= pos && y < childCenter) {
                            let outlineRect = new Rect(childX, childRect.y - 2, childWidth, 3);
                            dropInfo = new DropInfo(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
                            break;
                        }
                        pos = childCenter;
                    }
                    if (dropInfo == null) {
                        let outlineRect = new Rect(childX, childRect.getBottom() - 2, childWidth, 3);
                        dropInfo = new DropInfo(this, outlineRect, dockLocation, this._children.length, "flexlayout__outline_rect");
                    }
                }
                else {
                    let outlineRect = new Rect(this._tabHeaderRect.x + 2, this._tabHeaderRect.y + 1, 18, 3);
                    dropInfo = new DropInfo(this, outlineRect, dockLocation, 0, "flexlayout__outline_rect");

                }

            }
            if (!dragNode._canDockInto(dragNode, dropInfo)) {
                return null;
            }
        }
        else if (this.getSelected() != -1 && this._contentRect.contains(x, y)) {
            let outlineRect = this._contentRect;
            dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect");
            if (!dragNode._canDockInto(dragNode, dropInfo)) {
                return null;
            }
        }

        return dropInfo;
    }

    _drop(dragNode, location, index) {
        let fromIndex = 0;
        if (dragNode._parent != null) {
            fromIndex = dragNode._parent._removeChild(dragNode);
        }

        // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
        if (dragNode.getType() === TabNode.TYPE && dragNode._parent === this && fromIndex < index && index > 0) {
            index--;
        }

        // for the tabset/border being removed from set the selected index
        if (dragNode._parent !== null) {
            if (dragNode._parent.getType() === TabSetNode.TYPE) {
                dragNode._parent._setSelected(0);
            }
            else if (dragNode._parent.getType() === BorderNode.TYPE) {
                if (dragNode._parent.getSelected() != -1) {
                    if (fromIndex === dragNode._parent.getSelected() && dragNode._parent._children.length > 0) {
                        dragNode._parent._setSelected(0);
                    }
                    else if (fromIndex < dragNode._parent.getSelected()) {
                        dragNode._parent._setSelected(dragNode._parent.getSelected()-1);
                    }
                    else if (fromIndex > dragNode._parent.getSelected()) {
                        // leave selected index as is
                    }
                    else {
                        dragNode._parent._setSelected(-1);
                    }
                }
            }
        }

        // simple_bundled dock to existing tabset
        let insertPos = index;
        if (insertPos === -1) {
            insertPos = this._children.length;
        }

        if (dragNode.getType() === TabNode.TYPE) {
            this._addChild(dragNode, insertPos);
        }

        if (this.getSelected() !== -1) { // already open
            this._setSelected(insertPos);
        }

        this._model._tidy();
    }

    _toJson() {
        const json = {};
        attributeDefinitions.toJson(json, this._attributes);
        json.location = this._location.getName();
        json.children = this._children.map((child) => child._toJson());
        return json;
    }

    static _fromJson(json, model) {

        const location = DockLocation.getByName(json.location);
        const border = new BorderNode(location, json, model);
        if (json.children) {
            border._children = json.children.map((jsonChild) => {
                const child = TabNode._fromJson(jsonChild, model);
                child._parent = border;
                return child;
            });
        }

        return border;
    }

    _getSplitterBounds(splitter) {
        const pBounds = [0, 0];
        const outerRect = this._model._getOuterInnerRects().outer;
        const innerRect = this._model._getOuterInnerRects().inner;
        if (this._location === DockLocation.TOP) {
            pBounds[0] = outerRect.y;
            pBounds[1] = innerRect.getBottom() - splitter.getHeight();
        }
        else if (this._location === DockLocation.LEFT) {
            pBounds[0] = outerRect.x;
            pBounds[1] = innerRect.getRight() - splitter.getWidth();
        }
        else if (this._location === DockLocation.BOTTOM) {
            pBounds[0] = innerRect.y;
            pBounds[1] = outerRect.getBottom() - splitter.getHeight();
        }
        else if (this._location === DockLocation.RIGHT) {
            pBounds[0] = innerRect.x;
            pBounds[1] = outerRect.getRight() - splitter.getWidth();
        }
        return pBounds;
    }

    _calculateSplit(splitter, splitterPos) {
        const pBounds = this._getSplitterBounds(splitter);
        if (this._location == DockLocation.BOTTOM || this._location == DockLocation.RIGHT) {
            return Math.max(0, pBounds[1] - splitterPos);
        }
        else {
            return Math.max(0, splitterPos - pBounds[0]);
        }
    }

    _getAttributeDefinitions() {
        return attributeDefinitions;
    }
}

BorderNode.TYPE = "border";

let attributeDefinitions = new AttributeDefinitions();
attributeDefinitions.add("type", BorderNode.TYPE, true);

attributeDefinitions.add("size", 200);
attributeDefinitions.add("selected", -1);
attributeDefinitions.add("show", true).setType(Attribute.BOOLEAN);

attributeDefinitions.addInherited("barSize", "borderBarSize").setType(Attribute.INT).setFrom(0);
attributeDefinitions.addInherited("enableDrop", "borderEnableDrop").setType(Attribute.BOOLEAN);
attributeDefinitions.addInherited("className", "borderClassName").setType(Attribute.STRING);

export default BorderNode;