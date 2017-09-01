import Rect from "../Rect.js";
import JsonConverter from "../JsonConverter.js";
import Orientation from "../Orientation.js";
import DockLocation from "../DockLocation.js";
import SplitterNode from "./SplitterNode.js";
import Node from "./Node.js";
import TabSetNode from "./TabSetNode.js";
import BorderNode from "./BorderNode.js";
import DropInfo from "./../DropInfo.js";

class RowNode extends Node {

    constructor(model, json) {
        super(model);

        this._dirty = true;
        this._drawChildren = [];
        jsonConverter.fromJson(json, this);
        model._addNode(this);
    }

    _layout(rect) {
        super._layout(rect);

        const pixelSize = this._rect._getSize(this.getOrientation());

        let totalWeight = 0;
        let fixedPixels = 0;
        let prefPixels = 0;
        let numVariable = 0;
        let totalPrefWeight = 0;
        const drawChildren = this._getDrawChildren();

        for (var i = 0; i < drawChildren.length; i++) {
            var child = drawChildren[i];
            var prefSize = child._getPrefSize(this.getOrientation());
            if (child._fixed) {
                fixedPixels += prefSize;
            }
            else {
                if (prefSize == null) {
                    totalWeight += child._weight;
                }
                else {
                    prefPixels += prefSize;
                    totalPrefWeight += child._weight;
                }
                numVariable++;
            }
        }

        let resizePreferred = false;
        let availablePixels = pixelSize - fixedPixels - prefPixels;
        if (availablePixels < 0) {
            availablePixels = pixelSize - fixedPixels;
            resizePreferred = true;
            totalWeight += totalPrefWeight;
        }

        // assign actual pixel sizes
        let totalSizeGiven = 0;
        let variableSize = 0;
        for (var i = 0; i < drawChildren.length; i++) {
            var child = drawChildren[i];
            var prefSize = child._getPrefSize(this.getOrientation());
            if (child._fixed) {
                child.tempsize = prefSize;
            }
            else {
                if (prefSize == null || resizePreferred) {
                    if (totalWeight === 0) {
                        child.tempsize = 0;
                    }
                    else {
                        child.tempsize = Math.floor(availablePixels * (child._weight / totalWeight));
                    }
                    variableSize += child.tempsize;
                }
                else {
                    child.tempsize = prefSize;
                }
            }

            totalSizeGiven += child.tempsize;
        }

        // adjust sizes to exactly fit
        if (variableSize > 0) {
            while (totalSizeGiven < pixelSize) {
                for (var i = 0; i < drawChildren.length; i++) {
                    var child = drawChildren[i];
                    var prefSize = child._getPrefSize(this.getOrientation());
                    if (!child._fixed && (prefSize == null || resizePreferred) && totalSizeGiven < pixelSize) {
                        child.tempsize++;
                        totalSizeGiven++;
                    }
                }
            }
        }

        const childOrientation = Orientation.flip(this.getOrientation());

        // layout children
        let p = 0;
        for (var i = 0; i < drawChildren.length; i++) {
            var child = drawChildren[i];

            if (this.getOrientation() === Orientation.HORZ) {
                child._layout(new Rect(this._rect.x + p, this._rect.y, child.tempsize, this._rect.height));
            }
            else {
                child._layout(new Rect(this._rect.x, this._rect.y + p, this._rect.width, child.tempsize));
            }
            p += child.tempsize;
        }

        return true;
    }

    _getSplitterBounds(splitterNode) {
        const pBounds = [0, 0];
        const drawChildren = this._getDrawChildren();
        const p = drawChildren.indexOf(splitterNode);
        if (this.getOrientation() === Orientation.HORZ) {
            pBounds[0] = drawChildren[p - 1]._rect.x;
            pBounds[1] = drawChildren[p + 1]._rect.getRight() - splitterNode.getWidth();
        }
        else {
            pBounds[0] = drawChildren[p - 1]._rect.y;
            pBounds[1] = drawChildren[p + 1]._rect.getBottom() - splitterNode.getHeight();
        }
        return pBounds;
    }

    _calculateSplit(splitter, splitterPos) {
        let rtn = null;
        const drawChildren = this._getDrawChildren();
        const p = drawChildren.indexOf(splitter);
        const pBounds = this._getSplitterBounds(splitter);

        const weightedLength = drawChildren[p - 1]._weight + drawChildren[p + 1]._weight;

        const pixelWidth1 = Math.max(0, splitterPos - pBounds[0]);
        const pixelWidth2 = Math.max(0, pBounds[1] - splitterPos);

        if (pixelWidth1 + pixelWidth2 > 0) {
            const weight1 = (pixelWidth1 * weightedLength) / (pixelWidth1 + pixelWidth2);
            const weight2 = (pixelWidth2 * weightedLength) / (pixelWidth1 + pixelWidth2);

            rtn = {
                node1: drawChildren[p - 1].getId(), weight1: weight1, pixelWidth1: pixelWidth1,
                node2: drawChildren[p + 1].getId(), weight2: weight2, pixelWidth2: pixelWidth2
            }
        }

        return rtn;
    }

    _getDrawChildren() {
        if (this._dirty) {
            this._drawChildren = [];

            for (let i = 0; i < this._children.length; i++) {
                const child = this._children[i];
                if (i !== 0) {
                    const newSplitter = new SplitterNode(this._model);
                    newSplitter._parent = this;
                    this._drawChildren.push(newSplitter);
                }
                this._drawChildren.push(child);
            }
            this._dirty = false;
        }

        return this._drawChildren;
    }

    _tidy() {
        //console.log("a", this._model.toString());
        let i = 0;
        while (i < this._children.length) {
            const child = this._children[i];
            if (child._type === RowNode.TYPE) {
                child._tidy();

                if (child._children.length === 0) {
                    this._removeChild(child);
                }
                else if (child._children.length === 1) {
                    // hoist child/children up to this level
                    const subchild = child._children[0];
                    this._removeChild(child);
                    if (subchild._type === RowNode.TYPE) {
                        let subChildrenTotal = 0;
                        for (var j = 0; j < subchild._children.length; j++) {
                            var subsubChild = subchild._children[j];
                            subChildrenTotal += subsubChild._weight;
                        }
                        for (var j = 0; j < subchild._children.length; j++) {
                            var subsubChild = subchild._children[j];
                            subsubChild._weight = child._weight * subsubChild._weight / subChildrenTotal;
                            this._addChild(subsubChild, i + j);
                        }
                    }
                    else {
                        subchild._weight = child._weight;
                        this._addChild(subchild, i);
                    }
                }
                else {
                    i++;
                }
            }
            else if (child._type === TabSetNode.TYPE && child._children.length === 0) {
                // prevent removal of last tabset
                if (!(this === this._model._root && this._children.length === 1)
                    && child.isEnableClose()) {
                    this._removeChild(child);
                }
                else {
                    i++;
                }
            }
            else {
                i++;
            }
        }
        //console.log("b", this._model.toString());
    }

    _canDrop(dragNode, x, y) {
        const yy = y - this._rect.y;
        const xx = x - this._rect.x;
        const w = this._rect.width;
        const h = this._rect.height;
        const margin = 10; // height of edge rect
        const half = 50; // half width of edge rect
        let dropInfo = null;

        if (this._model.isEnableEdgeDock() && this._parent == null) { // _root row
            if (x < this._rect.x + margin && (yy > h / 2 - half && yy < h / 2 + half)) {
                var dockLocation = DockLocation.LEFT;
                var outlineRect = dockLocation.getDockRect(this._rect);
                outlineRect.width = outlineRect.width / 2;
                dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect_edge");
            }
            else if (x > this._rect.getRight() - margin && (yy > h / 2 - half && yy < h / 2 + half)) {
                var dockLocation = DockLocation.RIGHT;
                var outlineRect = dockLocation.getDockRect(this._rect);
                outlineRect.width = outlineRect.width / 2;
                outlineRect.x += outlineRect.width;
                dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect_edge");
            }
            else if (y < this._rect.y + margin && (xx > w / 2 - half && xx < w / 2 + half)) {
                var dockLocation = DockLocation.TOP;
                var outlineRect = dockLocation.getDockRect(this._rect);
                outlineRect.height = outlineRect.height / 2;
                dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect_edge");
            }
            else if (y > this._rect.getBottom() - margin && (xx > w / 2 - half && xx < w / 2 + half)) {
                var dockLocation = DockLocation.BOTTOM;
                var outlineRect = dockLocation.getDockRect(this._rect);
                outlineRect.height = outlineRect.height / 2;
                outlineRect.y += outlineRect.height;
                dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect_edge");
            }

            if (dropInfo != null) {
                if (!dragNode._canDockInto(dragNode, dropInfo)) {
                    return null;
                }
            }
        }

        return dropInfo;
    }

    _drop(dragNode, location, index) {
        const dockLocation = location;

        if (dragNode._parent) {
            dragNode._parent._removeChild(dragNode);
        }

        if (dragNode._parent !== null && dragNode._parent._type === TabSetNode.TYPE) {
            dragNode._parent._selected = 0;
        }

        if (dragNode._parent !== null && dragNode._parent._type === BorderNode.TYPE) {
            dragNode._parent._selected = -1;
        }

        let tabSet = null;
        if (dragNode._type === TabSetNode.TYPE) {
            tabSet = dragNode;
        }
        else {
            tabSet = new TabSetNode(this._model, {});
            tabSet._addChild(dragNode);
        }

        let size = 0;
        for (var i = 0; i < this._children.length; i++) {
            size += this._children[i]._weight;
        }

        if (size === 0) {
            size = 100;
        }

        tabSet._weight = size / 3;

        if (dockLocation === DockLocation.LEFT) {
            this._addChild(tabSet, 0);
        }
        else if (dockLocation === DockLocation.RIGHT) {
            this._addChild(tabSet);
        }
        else if (dockLocation === DockLocation.TOP) {
            var vrow = new RowNode(this._model, {});
            var hrow = new RowNode(this._model, {});
            hrow._weight = 75;
            tabSet._weight = 25;
            for (var i = 0; i < this._children.length; i++) {
                hrow._addChild(this._children[i]);
            }
            this._removeAll();
            vrow._addChild(tabSet);
            vrow._addChild(hrow);
            this._addChild(vrow);
        }
        else if (dockLocation === DockLocation.BOTTOM) {
            var vrow = new RowNode(this._model, {});
            var hrow = new RowNode(this._model, {});
            hrow._weight = 75;
            tabSet._weight = 25;
            for (var i = 0; i < this._children.length; i++) {
                hrow._addChild(this._children[i]);
            }
            this._removeAll();
            vrow._addChild(hrow);
            vrow._addChild(tabSet);
            this._addChild(vrow);
        }

        this._model._activeTabSet = tabSet;

        this._model._tidy();
    }

    _toJson() {
        const json = {};
        jsonConverter.toJson(json, this);

        json.children = [];
        this._children.forEach((child) => {
            json.children.push(child._toJson())
        });

        return json;
    }

    static _fromJson(json, model) {
        model._checkUniqueId(json);
        const newLayoutNode = new RowNode(model, json);

        if (json.children != undefined) {
            for (let i = 0; i < json.children.length; i++) {
                const jsonChild = json.children[i];
                if (jsonChild.type === TabSetNode.TYPE) {
                    var child = TabSetNode._fromJson(jsonChild, model);
                    newLayoutNode._addChild(child);
                }
                else {
                    var child = RowNode._fromJson(jsonChild, model);
                    newLayoutNode._addChild(child);
                }
            }
        }

        return newLayoutNode;
    }
}

RowNode.TYPE = "row";

var jsonConverter = new JsonConverter();
jsonConverter.addConversion("_type", "type", RowNode.TYPE, true);
jsonConverter.addConversion("_weight", "weight", 100);
jsonConverter.addConversion("_width", "width", null);
jsonConverter.addConversion("_height", "height", null);
jsonConverter.addConversion("_id", "id", null);

//console.log(jsonConverter.toTable());


export default RowNode;

