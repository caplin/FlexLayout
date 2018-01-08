import Rect from "../Rect.js";
import AttributeDefinitions from "../AttributeDefinitions.js";
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
        attributeDefinitions.fromJson(json, this._attributes);
        model._addNode(this);
    }

    getWeight() {
        return this._attributes["weight"];
    }

    getWidth() {
        return this._attributes["width"];
    }

    getHeight() {
        return this._attributes["height"];
    }

    _setWeight(weight) {
        this._attributes["weight"] = weight;
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

        for (let i = 0; i < drawChildren.length; i++) {
            let child = drawChildren[i];
            let prefSize = child._getPrefSize(this.getOrientation());
            if (child._fixed) {
                fixedPixels += prefSize;
            }
            else {
                if (prefSize == null) {
                    totalWeight += child.getWeight();
                }
                else {
                    prefPixels += prefSize;
                    totalPrefWeight += child.getWeight();
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
        for (let i = 0; i < drawChildren.length; i++) {
            let child = drawChildren[i];
            let prefSize = child._getPrefSize(this.getOrientation());
            if (child._fixed) {
                child.tempsize = prefSize;
            }
            else {
                if (prefSize == null || resizePreferred) {
                    if (totalWeight === 0) {
                        child.tempsize = 0;
                    }
                    else {
                        child.tempsize = Math.floor(availablePixels * (child.getWeight() / totalWeight));
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
                for (let i = 0; i < drawChildren.length; i++) {
                    let child = drawChildren[i];
                    let prefSize = child._getPrefSize(this.getOrientation());
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
        for (let i = 0; i < drawChildren.length; i++) {
            let child = drawChildren[i];

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

        const weightedLength = drawChildren[p - 1].getWeight() + drawChildren[p + 1].getWeight();

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
            if (child.getType() === RowNode.TYPE) {
                child._tidy();

                if (child._children.length === 0) {
                    this._removeChild(child);
                }
                else if (child._children.length === 1) {
                    // hoist child/children up to this level
                    const subchild = child._children[0];
                    this._removeChild(child);
                    if (subchild.getType() === RowNode.TYPE) {
                        let subChildrenTotal = 0;
                        for (let j = 0; j < subchild._children.length; j++) {
                            let subsubChild = subchild._children[j];
                            subChildrenTotal += subsubChild.getWeight();
                        }
                        for (let j = 0; j < subchild._children.length; j++) {
                            let subsubChild = subchild._children[j];
                            subsubChild._setWeight(child.getWeight() * subsubChild.getWeight() / subChildrenTotal);
                            this._addChild(subsubChild, i + j);
                        }
                    }
                    else {
                        subchild._setWeight(child.getWeight());
                        this._addChild(subchild, i);
                    }
                }
                else {
                    i++;
                }
            }
            else if (child.getType() === TabSetNode.TYPE && child._children.length === 0) {
                if (child.isEnableDeleteWhenEmpty()) {
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

        // add tabset into empty root
        if (this == this._model.getRoot() && this._children.length == 0) {
            let child = new TabSetNode(this._model, {type:"tabset"});
            this._addChild(child);
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
                let dockLocation = DockLocation.LEFT;
                let outlineRect = dockLocation.getDockRect(this._rect);
                outlineRect.width = outlineRect.width / 2;
                dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect_edge");
            }
            else if (x > this._rect.getRight() - margin && (yy > h / 2 - half && yy < h / 2 + half)) {
                let dockLocation = DockLocation.RIGHT;
                let outlineRect = dockLocation.getDockRect(this._rect);
                outlineRect.width = outlineRect.width / 2;
                outlineRect.x += outlineRect.width;
                dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect_edge");
            }
            else if (y < this._rect.y + margin && (xx > w / 2 - half && xx < w / 2 + half)) {
                let dockLocation = DockLocation.TOP;
                let outlineRect = dockLocation.getDockRect(this._rect);
                outlineRect.height = outlineRect.height / 2;
                dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect_edge");
            }
            else if (y > this._rect.getBottom() - margin && (xx > w / 2 - half && xx < w / 2 + half)) {
                let dockLocation = DockLocation.BOTTOM;
                let outlineRect = dockLocation.getDockRect(this._rect);
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

        if (dragNode._parent !== null && dragNode._parent.getType() === TabSetNode.TYPE) {
            dragNode._parent._setSelected(0);
        }

        if (dragNode._parent !== null && dragNode._parent.getType() === BorderNode.TYPE) {
            dragNode._parent._setSelected(-1);
        }

        let tabSet = null;
        if (dragNode.getType() === TabSetNode.TYPE) {
            tabSet = dragNode;
        }
        else {
            tabSet = new TabSetNode(this._model, {});
            tabSet._addChild(dragNode);
        }
        let size = this._children.reduce((sum, child) => {
            return sum + child.getWeight();
        }, 0);

        if (size === 0) {
            size = 100;
        }

        tabSet._setWeight(size / 3);

        if (dockLocation === DockLocation.LEFT) {
            this._addChild(tabSet, 0);
        }
        else if (dockLocation === DockLocation.RIGHT) {
            this._addChild(tabSet);
        }
        else if (dockLocation === DockLocation.TOP) {
            let vrow = new RowNode(this._model, {});
            let hrow = new RowNode(this._model, {});
            hrow._setWeight(75);
            tabSet._setWeight(25);
            this._children.forEach((child) => {
                hrow._addChild(child);
            });
            this._removeAll();
            vrow._addChild(tabSet);
            vrow._addChild(hrow);
            this._addChild(vrow);
        }
        else if (dockLocation === DockLocation.BOTTOM) {
            let vrow = new RowNode(this._model, {});
            let hrow = new RowNode(this._model, {});
            hrow._setWeight(75);
            tabSet._setWeight(25);
            this._children.forEach((child) => {
                hrow._addChild(child);
            });
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
        attributeDefinitions.toJson(json, this._attributes);

        json.children = [];
        this._children.forEach((child) => {
            json.children.push(child._toJson())
        });

        return json;
    }

    _updateAttrs(json) {
        attributeDefinitions.update(json, this._attributes);
    }

    static _fromJson(json, model) {
        const newLayoutNode = new RowNode(model, json);

        if (json.children != undefined) {
            for (let i = 0; i < json.children.length; i++) {
                const jsonChild = json.children[i];
                if (jsonChild.type === TabSetNode.TYPE) {
                    let child = TabSetNode._fromJson(jsonChild, model);
                    newLayoutNode._addChild(child);
                }
                else {
                    let child = RowNode._fromJson(jsonChild, model);
                    newLayoutNode._addChild(child);
                }
            }
        }

        return newLayoutNode;
    }

    _getAttributeDefinitions() {
        return attributeDefinitions;
    }
}

RowNode.TYPE = "row";

let attributeDefinitions = new AttributeDefinitions();
attributeDefinitions.add("type", RowNode.TYPE, true);
attributeDefinitions.add("id", null);

attributeDefinitions.add("weight", 100);
attributeDefinitions.add("width", null);
attributeDefinitions.add("height", null);

export default RowNode;

