import Rect from "../Rect";
import AttributeDefinitions from "../AttributeDefinitions";
import Orientation from "../Orientation";
import DockLocation from "../DockLocation";
import SplitterNode from "./SplitterNode";
import Node from "./Node";
import Model from "./Model";
import TabSetNode from "./TabSetNode";
import BorderNode from "./BorderNode";
import DropInfo from "./../DropInfo";
import IDropTarget from "./IDropTarget";
import IDraggable from "./IDraggable";

class RowNode extends Node implements IDropTarget{

    public static readonly TYPE = "row";
    /** @hidden @internal */
    private static _attributeDefinitions: AttributeDefinitions = RowNode._createAttributeDefinitions();
    /** @hidden @internal */
    private _drawChildren: Array<(Node)>;

    /** @hidden @internal */
    constructor(model: Model, json: any) {
        super(model);

        this._dirty = true;
        this._drawChildren = [];
        RowNode._attributeDefinitions.fromJson(json, this._attributes);
        model._addNode(this);
    }

    getWeight() {
        return this._attributes["weight"] as number;
    }

    getWidth() {
        return this._getAttributeAsNumberOrUndefined("width");
    }

    getHeight() {
        return this._getAttributeAsNumberOrUndefined("height");
    }

    /** @hidden @internal */
    _setWeight(weight: number) {
        this._attributes["weight"] = weight;
    }

    /** @hidden @internal */
    _layout(rect: Rect) {
        super._layout(rect);

        const pixelSize = this._rect._getSize(this.getOrientation());

        let totalWeight = 0;
        let fixedPixels = 0;
        let prefPixels = 0;
        let totalPrefWeight = 0;
        const drawChildren = this._getDrawChildren() as Array<RowNode | TabSetNode | SplitterNode>;

        for (let i = 0; i < drawChildren.length; i++) {
            let child = drawChildren[i];
            let prefSize = child._getPrefSize(this.getOrientation());
            if (child._isFixed()) {
                if (prefSize !== undefined) {
                    fixedPixels += prefSize;
                }
            }
            else {
                if (prefSize === undefined) {
                    totalWeight += child.getWeight();
                }
                else {
                    prefPixels += prefSize;
                    totalPrefWeight += child.getWeight();
                }
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
            if (child._isFixed()) {
                if (prefSize !== undefined) {
                    child._setTempSize(prefSize);
                }
            }
            else {
                if (prefSize == undefined || resizePreferred) {
                    if (totalWeight === 0) {
                        child._setTempSize(0);
                    }
                    else {
                        child._setTempSize(Math.floor(availablePixels * (child.getWeight() / totalWeight)));
                    }
                    variableSize += child._getTempSize();
                }
                else {
                    child._setTempSize(prefSize);
                }
            }

            totalSizeGiven += child._getTempSize();
        }

        // adjust sizes to exactly fit
        if (variableSize > 0) {
            while (totalSizeGiven < pixelSize) {
                for (let i = 0; i < drawChildren.length; i++) {
                    let child = drawChildren[i];
                    let prefSize = child._getPrefSize(this.getOrientation());
                    if (!child._isFixed() && (prefSize === undefined || resizePreferred) && totalSizeGiven < pixelSize) {
                        child._setTempSize(child._getTempSize() + 1);
                        totalSizeGiven++;
                    }
                }
            }
        }

        // layout children
        let p = 0;
        for (let i = 0; i < drawChildren.length; i++) {
            let child = drawChildren[i];

            if (this.getOrientation() === Orientation.HORZ) {
                child._layout(new Rect(this._rect.x + p, this._rect.y, child._getTempSize(), this._rect.height));
            }
            else {
                child._layout(new Rect(this._rect.x, this._rect.y + p, this._rect.width, child._getTempSize()));
            }
            p += child._getTempSize();
        }

        return true;
    }

    /** @hidden @internal */
    _getSplitterBounds(splitterNode: SplitterNode) {
        const pBounds = [0, 0];
        const drawChildren = this._getDrawChildren() as Array<RowNode | TabSetNode | SplitterNode>;
        const p = drawChildren.indexOf(splitterNode);
        if (this.getOrientation() === Orientation.HORZ) {
            pBounds[0] = drawChildren[p - 1].getRect().x;
            pBounds[1] = drawChildren[p + 1].getRect().getRight() - splitterNode.getWidth();
        }
        else {
            pBounds[0] = drawChildren[p - 1].getRect().y;
            pBounds[1] = drawChildren[p + 1].getRect().getBottom() - splitterNode.getHeight();
        }
        return pBounds;
    }

    /** @hidden @internal */
    _calculateSplit(splitter: SplitterNode, splitterPos: number) {
        let rtn = undefined;
        const drawChildren = this._getDrawChildren() as Array<RowNode | TabSetNode | SplitterNode>;
        const p = drawChildren.indexOf(splitter);
        const pBounds = this._getSplitterBounds(splitter);

        const weightedLength = drawChildren[p - 1].getWeight() + drawChildren[p + 1].getWeight();

        const pixelWidth1 = Math.max(0, splitterPos - pBounds[0]);
        const pixelWidth2 = Math.max(0, pBounds[1] - splitterPos);

        if (pixelWidth1 + pixelWidth2 > 0) {
            const weight1 = (pixelWidth1 * weightedLength) / (pixelWidth1 + pixelWidth2);
            const weight2 = (pixelWidth2 * weightedLength) / (pixelWidth1 + pixelWidth2);

            rtn = {
                node1Id: drawChildren[p - 1].getId(), weight1: weight1, pixelWidth1: pixelWidth1,
                node2Id: drawChildren[p + 1].getId(), weight2: weight2, pixelWidth2: pixelWidth2
            }
        }

        return rtn;
    }

    /** @hidden @internal */
    _getDrawChildren(): Array<Node> | undefined{
        if (this._dirty) {
            this._drawChildren = [];

            for (let i = 0; i < this._children.length; i++) {
                const child = this._children[i] as RowNode | TabSetNode;
                if (i !== 0) {
                    const newSplitter = new SplitterNode(this._model);
                    newSplitter._setParent(this);
                    this._drawChildren.push(newSplitter);
                }
                this._drawChildren.push(child);
            }
            this._dirty = false;
        }

        return this._drawChildren;
    }

    /** @hidden @internal */
    _tidy() {
        //console.log("a", this._model.toString());
        let i = 0;
        while (i < this._children.length) {
            const child = this._children[i];
            if (child instanceof RowNode) {
                child._tidy();

                let childChildren = child.getChildren();
                if (childChildren.length === 0) {
                    this._removeChild(child);
                }
                else if (childChildren.length === 1) {
                    // hoist child/children up to this level
                    const subchild = childChildren[0];
                    this._removeChild(child);
                    if (subchild instanceof RowNode) {
                        let subChildrenTotal = 0;
                        let subChildChildren = subchild.getChildren();
                        for (let j = 0; j < subChildChildren.length; j++) {
                            let subsubChild = subChildChildren[j] as RowNode | TabSetNode;
                            subChildrenTotal += subsubChild.getWeight();
                        }
                        for (let j = 0; j < subChildChildren.length; j++) {
                            let subsubChild = subChildChildren[j] as RowNode | TabSetNode;
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
            else if (child instanceof TabSetNode && child.getChildren().length === 0) {
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
        if (this === this._model.getRoot() && this._children.length === 0) {
            let child = new TabSetNode(this._model, { type: "tabset" });
            this._addChild(child);
        }

        //console.log("b", this._model.toString());
    }

    /** @hidden @internal */
    canDrop(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined {
        const yy = y - this._rect.y;
        const xx = x - this._rect.x;
        const w = this._rect.width;
        const h = this._rect.height;
        const margin = 10; // height of edge rect
        const half = 50; // half width of edge rect
        let dropInfo = undefined;

        if (this._model.isEnableEdgeDock() && this._parent === undefined) { // _root row
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

            if (dropInfo !== undefined) {
                if (!dragNode._canDockInto(dragNode, dropInfo)) {
                    return undefined;
                }
            }
        }

        return dropInfo;
    }

    /** @hidden @internal */
    drop(dragNode: (Node & IDraggable), location: DockLocation, index: number): void {
        const dockLocation = location;

        let parent = dragNode.getParent();

        if (parent) {
            parent._removeChild(dragNode);
        }

        if (parent !== undefined && parent!.getType() === TabSetNode.TYPE) {
            parent._setSelected(0);
        }

        if (parent !== undefined && parent!.getType() === BorderNode.TYPE) {
            parent._setSelected(-1);
        }

        let tabSet: TabSetNode | undefined = undefined;
        if (dragNode instanceof TabSetNode) {
            tabSet = dragNode;
        }
        else {
            tabSet = new TabSetNode(this._model, {});
            tabSet._addChild(dragNode);
        }
        let size = this._children.reduce((sum, child) => {
            return sum + (child as RowNode | TabSetNode).getWeight();
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

        this._model._setActiveTabset(tabSet);

        this._model._tidy();
    }

    /** @hidden @internal */
    _toJson() {
        const json: any = {};
        RowNode._attributeDefinitions.toJson(json, this._attributes);

        json.children = [];
        this._children.forEach((child) => {
            json.children.push(child._toJson())
        });

        return json;
    }

    /** @hidden @internal */
    static _fromJson(json: any, model: Model) {
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

    isEnableDrop() {
        return true;
    }

    /** @hidden @internal */
    _getPrefSize(orientation: Orientation) {
        let prefSize = this.getWidth();
        if (orientation === Orientation.VERT) {
            prefSize = this.getHeight();
        }
        return prefSize;
    }

    /** @hidden @internal */
    _getAttributeDefinitions() {
        return RowNode._attributeDefinitions;
    }

    /** @hidden @internal */
    _updateAttrs(json: any) {
        RowNode._attributeDefinitions.update(json, this._attributes);
    }

    /** @hidden @internal */
    private static _createAttributeDefinitions(): AttributeDefinitions {
        let attributeDefinitions = new AttributeDefinitions();
        attributeDefinitions.add("type", RowNode.TYPE, true);
        attributeDefinitions.add("id", undefined);

        attributeDefinitions.add("weight", 100);
        attributeDefinitions.add("width", undefined);
        attributeDefinitions.add("height", undefined);

        return attributeDefinitions;
    }
}

export default RowNode;
