import Rect from "../Rect.js";
import JsonConverter from "../JsonConverter.js";
import DockLocation from "../DockLocation.js";
import Orientation from "../Orientation.js";
import DropInfo from "./../DropInfo.js";
import Node from "./Node.js";
import TabNode from "./TabNode.js";
import TabSetNode from "./TabSetNode.js";
import SplitterNode from "./SplitterNode.js";
import BorderSet from "./BorderSet.js";

class BorderNode extends Node {

    constructor(location, json, model) {
        super(model);

        this._contentRect = null;
        this._tabHeaderRect = null;
        this._location = location;
        this._drawChildren = [];
        this._id = "border_" + location.getName();
        jsonConverter.fromJson(json, this);
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
        return this._getAttr("_borderEnableDrop");
    }

    getClassNameBorder() {
        return this._getAttr("_borderClassName");
    }

    getBorderBarSize() {
        return this._getAttr("_borderBarSize");
    }

    getSize() {
        return this._size;
    }

    getSelected() {
        return this._selected;
    }

    _setSelected(index) {
        this._selected = index;
    }

    getOrientation() {
        return this._location.getOrientation();
    }

    _setSize(pos) {
        this._size = pos;
    }

    _updateAttrs(json) {
        jsonConverter.updateAttrs(json, this);
    }

    _getDrawChildren() {
        return this._drawChildren;
    }

    isMaximized() {
        return false;
    }

    _setAdjustedSize(size) {
        this._adjustedSize = size;
    }

    _getAdjustedSize() {
        return this._adjustedSize;
    }

    _layout(borderRects) {
        this._drawChildren = [];
        let location = this._location;

        let split1 = location.split(borderRects.outer, this.getBorderBarSize()); // split border outer
        let split2 = location.split(borderRects.inner, this.getBorderBarSize()); // split border inner
        let split3 = location.split(split2.end, this._adjustedSize + this._model.getSplitterSize()); // split off tab contents
        let split4 = location.reflect().split(split3.start, this._model.getSplitterSize()); // split contents into content and splitter

        this._tabHeaderRect = split2.start;
        this._contentRect = split4.end;

        for (let i = 0; i < this._children.length; i++) {
            this._children[i]._layout(this._contentRect);
            this._drawChildren.push(this._children[i]);
        }

        if (this._selected == -1) {
            return {outer: split1.end, inner: split2.end};
        }
        else {
            let newSplitter = new SplitterNode(this._model);
            newSplitter._parent = this;
            newSplitter._rect = split4.start;
            this._drawChildren.push(newSplitter);

            return {outer: split1.end, inner: split3.end};
        }
        return borderRects;
    }

    _remove(node) {
        if (this._selected != -1) {
            let selectedNode = this._children[this._selected];
            if (node === selectedNode) {
                this._selected = -1;
            }
            else {
                this._removeChild(node);
                for (let i = 0; i < this._children.length; i++) {
                    if (this._children[i] === selectedNode) {
                        this._selected = i;
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
        let dockLocation = DockLocation.CENTER;

        if (this._tabHeaderRect.contains(x, y)) {
            if (this._location._orientation == Orientation.VERT) {
                if (this._children.length > 0) {
                    let child = this._children[0];
                    let childRect = child._tabRect;
                    let childY = childRect.y;

                    let childHeight = childRect.height;

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
                    let childX = childRect.x;
                    let childWidth = childRect.width;

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
        else if (this._selected != -1 && this._contentRect.contains(x, y)) {
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
        if (dragNode._type === TabNode.TYPE && dragNode._parent === this && fromIndex < index && index > 0) {
            index--;
        }

        // for the tabset/border being removed from set the selected index
        if (dragNode._parent !== null) {
            if (dragNode._parent._type === TabSetNode.TYPE) {
                dragNode._parent._selected = 0;
            }
            else if (dragNode._parent._type === BorderNode.TYPE) {
                dragNode._parent._selected = -1;
            }
        }

        // simple_bundled dock to existing tabset
        let insertPos = index;
        if (insertPos === -1) {
            insertPos = this._children.length;
        }

        if (dragNode._type === TabNode.TYPE) {
            this._addChild(dragNode, insertPos);
        }

        if (index == -1) {
            this._selected = insertPos;
        }

        this._model._tidy();
    }

    _toJson() {
        let json = {};
        jsonConverter.toJson(json, this);
        json.location = this._location.getName();
        json.children = [];
        for (let i = 0; i < this._children.length; i++) {
            let jsonChild = this._children[i]._toJson();
            json.children.push(jsonChild);
        }
        return json;
    }

    static _fromJson(json, model) {

        let location = DockLocation.getByName(json.location);
        let border = new BorderNode(location, json, model);
        if (json.children) {
            for (let i = 0; i < json.children.length; i++) {
                let child = TabNode._fromJson(json.children[i], model);
                child._parent = border;
                border._children.push(child);
            }
        }

        return border;
    }

    _getSplitterBounds(splitter) {
        let pBounds = [0, 0];
        let outerRect = this._model.getOuterInnerRects().outer;
        let innerRect = this._model.getOuterInnerRects().inner;
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
        let pBounds = this._getSplitterBounds(splitter);
        if (this._location == DockLocation.BOTTOM || this._location == DockLocation.RIGHT) {
            return Math.max(0, pBounds[1] - splitterPos);
        }
        else {
            return Math.max(0, splitterPos - pBounds[0]);
        }
    }
}

BorderNode.TYPE = "border";

let jsonConverter = new JsonConverter();
jsonConverter.addConversion("_type", "type", BorderNode.TYPE, true);
jsonConverter.addConversion("_size", "size", 200);
jsonConverter.addConversion("_selected", "selected", -1);

jsonConverter.addConversion("_borderBarSize", "borderBarSize", undefined);
jsonConverter.addConversion("_borderEnableDrop", "borderEnableDrop", undefined);
jsonConverter.addConversion("_borderClassName", "borderClassName",undefined);


export default BorderNode;