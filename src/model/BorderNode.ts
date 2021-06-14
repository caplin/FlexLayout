import Attribute from "../Attribute";
import AttributeDefinitions from "../AttributeDefinitions";
import DockLocation from "../DockLocation";
import DropInfo from "../DropInfo";
import Orientation from "../Orientation";
import Rect from "../Rect";
import IDraggable from "./IDraggable";
import IDropTarget from "./IDropTarget";
import Model, { ILayoutMetrics } from "./Model";
import Node from "./Node";
import SplitterNode from "./SplitterNode";
import TabNode from "./TabNode";
import TabSetNode from "./TabSetNode";
import { adjustSelectedIndex } from "./Utils";

class BorderNode extends Node implements IDropTarget {
    static readonly TYPE = "border";

    /** @hidden @internal */
    static _fromJson(json: any, model: Model) {
        const location = DockLocation.getByName(json.location);
        const border = new BorderNode(location, json, model);
        if (json.children) {
            border._children = json.children.map((jsonChild: any) => {
                const child = TabNode._fromJson(jsonChild, model);
                child._setParent(border);
                return child;
            });
        }

        return border;
    }
    /** @hidden @internal */
    private static _attributeDefinitions: AttributeDefinitions = BorderNode._createAttributeDefinitions();

    /** @hidden @internal */
    private static _createAttributeDefinitions(): AttributeDefinitions {
        const attributeDefinitions = new AttributeDefinitions();
        attributeDefinitions.add("type", BorderNode.TYPE, true).setType(Attribute.STRING).setFixed();

        attributeDefinitions.add("selected", -1).setType(Attribute.NUMBER);
        attributeDefinitions.add("show", true).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("config", undefined).setType("any");

        attributeDefinitions.addInherited("barSize", "borderBarSize").setType(Attribute.NUMBER);
        attributeDefinitions.addInherited("enableDrop", "borderEnableDrop").setType(Attribute.BOOLEAN);
        attributeDefinitions.addInherited("className", "borderClassName").setType(Attribute.STRING);
        attributeDefinitions.addInherited("autoSelectTabWhenOpen", "borderAutoSelectTabWhenOpen").setType(Attribute.BOOLEAN);
        attributeDefinitions.addInherited("autoSelectTabWhenClosed", "borderAutoSelectTabWhenClosed").setType(Attribute.BOOLEAN);
        attributeDefinitions.addInherited("size", "borderSize").setType(Attribute.NUMBER);
        attributeDefinitions.addInherited("minSize", "borderMinSize").setType(Attribute.NUMBER);
        return attributeDefinitions;
    }

    /** @hidden @internal */
    private _contentRect?: Rect;
    /** @hidden @internal */
    private _tabHeaderRect?: Rect;
    /** @hidden @internal */
    private _location: DockLocation;
    /** @hidden @internal */
    private _drawChildren: Node[];
    /** @hidden @internal */
    private _adjustedSize: number = 0;
    /** @hidden @internal */
    private _calculatedBorderBarSize: number = 0;

    /** @hidden @internal */
    constructor(location: DockLocation, json: any, model: Model) {
        super(model);

        this._location = location;
        this._drawChildren = [];
        this._attributes.id = `border_${location.getName()}`;
        BorderNode._attributeDefinitions.fromJson(json, this._attributes);
        model._addNode(this);
    }

    getLocation() {
        return this._location;
    }

    getTabHeaderRect() {
        return this._tabHeaderRect;
    }

    getRect() {
        return this._tabHeaderRect!;
    }

    getContentRect() {
        return this._contentRect;
    }

    isEnableDrop() {
        return this._getAttr("enableDrop") as boolean;
    }

    isAutoSelectTab(whenOpen?: boolean) {
        if (whenOpen == null) {
            whenOpen = this.getSelected() !== -1;
        }
        if (whenOpen) {
            return this._getAttr("autoSelectTabWhenOpen") as boolean;
        } else {
            return this._getAttr("autoSelectTabWhenClosed") as boolean;
        }
    }

    getClassName() {
        return this._getAttr("className") as string | undefined;
    }

    /** @hidden @internal */
    calcBorderBarSize(metrics: ILayoutMetrics) {
        const barSize = this._getAttr("barSize") as number;
        if (barSize !== 0) {
            // its defined
            this._calculatedBorderBarSize = barSize;
        } else {
            this._calculatedBorderBarSize = metrics.borderBarSize;
        }
    }

    getBorderBarSize() {
        return this._calculatedBorderBarSize;
    }

    getSize() {
        return this._getAttr("size") as number;
    }

    getMinSize() {
        return this._getAttr("minSize") as number;
    }

    getSelected(): number {
        return this._attributes.selected as number;
    }

    getSelectedNode(): Node | undefined {
        if (this.getSelected() !== -1) {
            return this._children[this.getSelected()];
        }
        return undefined;
    }

    getOrientation() {
        return this._location.getOrientation();
    }

    /**
     * Returns the config attribute that can be used to store node specific data that
     * WILL be saved to the json. The config attribute should be changed via the action Actions.updateNodeAttributes rather
     * than directly, for example:
     * this.state.model.doAction(
     *   FlexLayout.Actions.updateNodeAttributes(node.getId(), {config:myConfigObject}));
     */
     getConfig() {
        return this._attributes.config;
    }

    isMaximized() {
        return false;
    }

    isShowing() {
        return this._attributes.show as boolean;
    }

    /** @hidden @internal */
    _setSelected(index: number) {
        this._attributes.selected = index;
    }

    /** @hidden @internal */
    _setSize(pos: number) {
        this._attributes.size = pos;
    }

    /** @hidden @internal */
    _updateAttrs(json: any) {
        BorderNode._attributeDefinitions.update(json, this._attributes);
    }

    /** @hidden @internal */
    _getDrawChildren() {
        return this._drawChildren;
    }

    /** @hidden @internal */
    _setAdjustedSize(size: number) {
        this._adjustedSize = size;
    }

    /** @hidden @internal */
    _getAdjustedSize() {
        return this._adjustedSize;
    }

    /** @hidden @internal */
    _layoutBorderOuter(outer: Rect, metrics: ILayoutMetrics) {
        this.calcBorderBarSize(metrics);
        const split1 = this._location.split(outer, this.getBorderBarSize()); // split border outer
        this._tabHeaderRect = split1.start;
        return split1.end;
    }

    /** @hidden @internal */
    _layoutBorderInner(inner: Rect, metrics: ILayoutMetrics) {
        this._drawChildren = [];
        const location = this._location;

        const split1 = location.split(inner, this._adjustedSize + this._model.getSplitterSize()); // split off tab contents
        const split2 = location.reflect().split(split1.start, this._model.getSplitterSize()); // split contents into content and splitter

        this._contentRect = split2.end;

        this._children.forEach((child, i) => {
            child._layout(this._contentRect!, metrics);
            child._setVisible(i === this.getSelected());
            this._drawChildren.push(child);
        });

        if (this.getSelected() === -1) {
            return inner;
        } else {
            const newSplitter = new SplitterNode(this._model);
            newSplitter._setParent(this);
            newSplitter._setRect(split2.start);
            this._drawChildren.push(newSplitter);

            return split1.end;
        }
    }

    /** @hidden @internal */
    _remove(node: TabNode) {
        const removedIndex = this._removeChild(node);
        if (this.getSelected() !== -1) {
            adjustSelectedIndex(this, removedIndex);
        }
    }

    /** @hidden @internal */
    canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
        if (dragNode.getType() !== TabNode.TYPE) {
            return undefined;
        }

        let dropInfo;
        const dockLocation = DockLocation.CENTER;

        if (this._tabHeaderRect!.contains(x, y)) {
            if (this._location._orientation === Orientation.VERT) {
                if (this._children.length > 0) {
                    let child = this._children[0];
                    let childRect = (child as TabNode).getTabRect()!;
                    const childY = childRect.y;

                    const childHeight = childRect.height;

                    let pos = this._tabHeaderRect!.x;
                    let childCenter = 0;
                    for (let i = 0; i < this._children.length; i++) {
                        child = this._children[i];
                        childRect = (child as TabNode).getTabRect()!;
                        childCenter = childRect.x + childRect.width / 2;
                        if (x >= pos && x < childCenter) {
                            const outlineRect = new Rect(childRect.x - 2, childY, 3, childHeight);
                            dropInfo = new DropInfo(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
                            break;
                        }
                        pos = childCenter;
                    }
                    if (dropInfo == null) {
                        const outlineRect = new Rect(childRect.getRight() - 2, childY, 3, childHeight);
                        dropInfo = new DropInfo(this, outlineRect, dockLocation, this._children.length, "flexlayout__outline_rect");
                    }
                } else {
                    const outlineRect = new Rect(this._tabHeaderRect!.x + 1, this._tabHeaderRect!.y + 2, 3, 18);
                    dropInfo = new DropInfo(this, outlineRect, dockLocation, 0, "flexlayout__outline_rect");
                }
            } else {
                if (this._children.length > 0) {
                    let child = this._children[0];
                    let childRect = (child as TabNode).getTabRect()!;
                    const childX = childRect.x;
                    const childWidth = childRect.width;

                    let pos = this._tabHeaderRect!.y;
                    let childCenter = 0;
                    for (let i = 0; i < this._children.length; i++) {
                        child = this._children[i];
                        childRect = (child as TabNode).getTabRect()!;
                        childCenter = childRect.y + childRect.height / 2;
                        if (y >= pos && y < childCenter) {
                            const outlineRect = new Rect(childX, childRect.y - 2, childWidth, 3);
                            dropInfo = new DropInfo(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
                            break;
                        }
                        pos = childCenter;
                    }
                    if (dropInfo == null) {
                        const outlineRect = new Rect(childX, childRect.getBottom() - 2, childWidth, 3);
                        dropInfo = new DropInfo(this, outlineRect, dockLocation, this._children.length, "flexlayout__outline_rect");
                    }
                } else {
                    const outlineRect = new Rect(this._tabHeaderRect!.x + 2, this._tabHeaderRect!.y + 1, 18, 3);
                    dropInfo = new DropInfo(this, outlineRect, dockLocation, 0, "flexlayout__outline_rect");
                }
            }
            if (!dragNode._canDockInto(dragNode, dropInfo)) {
                return undefined;
            }
        } else if (this.getSelected() !== -1 && this._contentRect!.contains(x, y)) {
            const outlineRect = this._contentRect;
            dropInfo = new DropInfo(this, outlineRect!, dockLocation, -1, "flexlayout__outline_rect");
            if (!dragNode._canDockInto(dragNode, dropInfo)) {
                return undefined;
            }
        }

        return dropInfo;
    }

    /** @hidden @internal */
    drop(dragNode: Node & IDraggable, location: DockLocation, index: number, select?: boolean): void {
        let fromIndex = 0;
        const dragParent = dragNode.getParent() as BorderNode | TabSetNode;
        if (dragParent !== undefined) {
            fromIndex = dragParent._removeChild(dragNode);
            adjustSelectedIndex(dragParent, fromIndex);
        }

        // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
        if (dragNode.getType() === TabNode.TYPE && dragParent === this && fromIndex < index && index > 0) {
            index--;
        }

        // simple_bundled dock to existing tabset
        let insertPos = index;
        if (insertPos === -1) {
            insertPos = this._children.length;
        }

        if (dragNode.getType() === TabNode.TYPE) {
            this._addChild(dragNode, insertPos);
        }

        if (select || (select !== false && this.isAutoSelectTab())) {
            this._setSelected(insertPos);
        }

        this._model._tidy();
    }

    /** @hidden @internal */
    _toJson() {
        const json: any = {};
        BorderNode._attributeDefinitions.toJson(json, this._attributes);
        json.location = this._location.getName();
        json.children = this._children.map((child) => (child as TabNode)._toJson());
        return json;
    }

    /** @hidden @internal */
    _getSplitterBounds(splitter: SplitterNode, useMinSize: boolean = false) {
        const pBounds = [0, 0];
        const minSize = useMinSize ? this.getMinSize() : 0;
        const outerRect = this._model._getOuterInnerRects().outer;
        const innerRect = this._model._getOuterInnerRects().inner;
        if (this._location === DockLocation.TOP) {
            pBounds[0] = outerRect.y + minSize;
            pBounds[1] = innerRect.getBottom() - splitter.getHeight();
        } else if (this._location === DockLocation.LEFT) {
            pBounds[0] = outerRect.x + minSize;
            pBounds[1] = innerRect.getRight() - splitter.getWidth();
        } else if (this._location === DockLocation.BOTTOM) {
            pBounds[0] = innerRect.y;
            pBounds[1] = outerRect.getBottom() - splitter.getHeight() - minSize;
        } else if (this._location === DockLocation.RIGHT) {
            pBounds[0] = innerRect.x;
            pBounds[1] = outerRect.getRight() - splitter.getWidth() - minSize;
        }
        return pBounds;
    }

    /** @hidden @internal */
    _calculateSplit(splitter: SplitterNode, splitterPos: number) {
        const pBounds = this._getSplitterBounds(splitter);
        if (this._location === DockLocation.BOTTOM || this._location === DockLocation.RIGHT) {
            return Math.max(0, pBounds[1] - splitterPos);
        } else {
            return Math.max(0, splitterPos - pBounds[0]);
        }
    }

    /** @hidden @internal */
    _getAttributeDefinitions() {
        return BorderNode._attributeDefinitions;
    }

    /** @hidden @internal */
    static getAttributeDefinitions() {
        return BorderNode._attributeDefinitions;
    }

}

export default BorderNode;
