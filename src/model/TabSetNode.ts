import Rect from "../Rect";
import AttributeDefinitions from "../AttributeDefinitions";
import Attribute from "../Attribute";
import DockLocation from "../DockLocation";
import DropInfo from "./../DropInfo";
import Node from "./Node";
import Model from "./Model";
import TabNode from "./TabNode";
import RowNode from "./RowNode";
import BorderNode from "./BorderNode";
import Orientation from "../Orientation";
import IDraggable from "./IDraggable";
import IDropTarget from "./IDropTarget";

class TabSetNode extends Node implements IDraggable, IDropTarget{
    public static readonly TYPE = "tabset";
    /** @hidden @internal */
    private static _attributeDefinitions: AttributeDefinitions = TabSetNode._createAttributeDefinitions();

    /** @hidden @internal */
    private _contentRect: Rect;
    /** @hidden @internal */
    private _headerRect: Rect;
    /** @hidden @internal */
    private _tabHeaderRect: Rect;

    /** @hidden @internal */
    constructor(model: Model, json: any) {
        super(model);

        TabSetNode._attributeDefinitions.fromJson(json, this._attributes);
        model._addNode(this);
    }

    getName() {
        return this._attributes["name"] as string;
    }

    getSelected() {
        return this._attributes["selected"] as number;
    }

    getSelectedNode() {
        let selected = this.getSelected();
        if (selected !== -1) {
            return this._children[selected];
        }
        return null;
    }

    getWeight(): number {
        return this._attributes["weight"] as number;
    }

    getWidth(): number {
        return this._attributes["width"] as number;
    }

    getHeight(): number {
        return this._attributes["height"] as number;
    }

    isMaximized() {
        return this._model.getMaximizedTabset() === this;
    }

    isActive() {
        return this._model.getActiveTabset() === this;
    }

    isEnableDeleteWhenEmpty() {
        return this._getAttr("enableDeleteWhenEmpty") as boolean;
    }

    isEnableDrop() {
        return this._getAttr("enableDrop") as boolean;
    }

    isEnableDrag() {
        return this._getAttr("enableDrag") as boolean;
    }

    isEnableDivide() {
        return this._getAttr("enableDivide") as boolean;
    }

    isEnableMaximize() {
        return this._getAttr("enableMaximize") as boolean;
    }

    isEnableTabStrip() {
        return this._getAttr("enableTabStrip") as boolean;
    }

    getClassNameTabStrip() {
        return this._getAttr("classNameTabStrip") as string;
    }

    getClassNameHeader() {
        return this._getAttr("classNameHeader") as string;
    }

    getHeaderHeight() {
        return this._getAttr("headerHeight") as number;
    }

    getTabStripHeight() {
        return this._getAttr("tabStripHeight") as number;
    }

    /** @hidden @internal */
    _setWeight(weight: number) {
        this._attributes["weight"] = weight;
    }

    /** @hidden @internal */
    _setSelected(index: number) {
        this._attributes["selected"] = index;
    }

    /** @hidden @internal */
    canDrop(dragNode: (Node & IDraggable), x: number, y: number): DropInfo {
        let dropInfo = null;

        if (dragNode === this) {
            let dockLocation = DockLocation.CENTER;
            let outlineRect = this._tabHeaderRect;
            dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect");
        }
        else if (this._contentRect.contains(x, y)) {
            let dockLocation = DockLocation.getLocation(this._contentRect, x, y);
            let outlineRect = dockLocation.getDockRect(this._rect);
            dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect");
        }
        else if (this._children.length > 0 && this._tabHeaderRect != null && this._tabHeaderRect.contains(x, y)) {
            let child = this._children[0] as TabNode;
            let r = child.getTabRect();
            const yy = r.y;
            const h = r.height;
            let p = this._tabHeaderRect.x;
            let childCenter = 0;
            for (let i = 0; i < this._children.length; i++) {
                child = this._children[i] as TabNode;
                r = child.getTabRect();
                childCenter = r.x + r.width / 2;
                if (x >= p && x < childCenter) {
                    let dockLocation = DockLocation.CENTER;
                    let outlineRect = new Rect(r.x - 2, yy, 3, h);
                    dropInfo = new DropInfo(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
                    break;
                }
                p = childCenter;
            }
            if (dropInfo == null) {
                let dockLocation = DockLocation.CENTER;
                let outlineRect = new Rect(r.getRight() - 2, yy, 3, h);
                dropInfo = new DropInfo(this, outlineRect, dockLocation, this._children.length, "flexlayout__outline_rect");
            }
        }

        if (!dragNode._canDockInto(dragNode, dropInfo)) {
            return null;
        }

        return dropInfo;
    }

    /** @hidden @internal */
    _layout(rect: Rect) {

        if (this.isMaximized()) {
            rect = this._model.getRoot().getRect();
        }

        rect = rect.removeInsets(this._getAttr("marginInsets"));
        this._rect = rect;
        rect = rect.removeInsets(this._getAttr("borderInsets"));
        
        const showHeader = (this.getName() != null);
        let y = 0;
        if (showHeader) {
            this._headerRect = new Rect(rect.x, rect.y, rect.width, this.getHeaderHeight());
            y += this.getHeaderHeight();
        }
        if (this.isEnableTabStrip()) {
            this._tabHeaderRect = new Rect(rect.x, rect.y + y, rect.width, this.getTabStripHeight());
            y += this.getTabStripHeight();
        }
        this._contentRect = new Rect(rect.x, rect.y + y, rect.width, rect.height - y);

        this._children.forEach((child, i) => {
            child._layout(this._contentRect);
            child._setVisible(i === this.getSelected());
        });
    }

    /** @hidden @internal */
    _remove(node: TabNode) {
        this._removeChild(node);
        this._model._tidy();
        this._setSelected(Math.max(0, this.getSelected() - 1));
    }

    /** @hidden @internal */
    drop(dragNode: (Node & IDraggable), location: DockLocation, index: number) {
        const dockLocation = location;

        if (this === dragNode) { // tabset drop into itself
            return; // dock back to itself
        }

        let selectedNode = null;
        let dragParent = dragNode.getParent() as (BorderNode | TabSetNode);
        let fromIndex = 0;
        if (dragParent != null) {
            selectedNode = dragParent.getSelectedNode;
            fromIndex = dragParent._removeChild(dragNode);
        }
        //console.log("removed child: " + fromIndex);

        // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
        if (dragNode.getType() === TabNode.TYPE && dragParent === this && fromIndex < index && index > 0) {
            index--;
        }

        // for the tabset/border being removed from set the selected index
        if (dragParent !== null) {
            if (dragParent.getType() === TabSetNode.TYPE) {
                dragParent._setSelected(0);
            }
            else if (dragParent.getType() === BorderNode.TYPE) {
                if (dragParent.getSelected() !== -1) {
                    if (fromIndex === dragParent.getSelected() && dragParent.getChildren().length > 0) {
                        dragParent._setSelected(0);
                    }
                    else if (fromIndex < dragParent.getSelected()) {
                        dragParent._setSelected(dragParent.getSelected() - 1);
                    }
                    else if (fromIndex > dragParent.getSelected()) {
                        // leave selected index as is
                    }
                    else {
                        dragParent._setSelected(-1);
                    }
                }
            }
        }

        // simple_bundled dock to existing tabset
        if (dockLocation === DockLocation.CENTER) {
            let insertPos = index;
            if (insertPos === -1) {
                insertPos = this._children.length;
            }

            if (dragNode.getType() === TabNode.TYPE) {
                this._addChild(dragNode, insertPos);
                this._setSelected(insertPos);
                //console.log("added child at : " + insertPos);
            }
            else {
                dragNode.getChildren().forEach((child, i) => {
                    this._addChild(child, insertPos);
                    //console.log("added child at : " + insertPos);
                    insertPos++;
                });
            }
            this._model._setActiveTabset(this);

        }
        else {
            let tabSet: TabSetNode = null;
            if (dragNode instanceof TabNode) {
                // create new tabset parent
                //console.log("create a new tabset");
                tabSet = new TabSetNode(this._model, {});
                tabSet._addChild(dragNode);
                //console.log("added child at end");
                dragParent = tabSet;
            }
            else {
                tabSet = dragNode as TabSetNode;
            }

            const parentRow = this._parent;
            const pos = parentRow.getChildren().indexOf(this);

            if (parentRow.getOrientation() === dockLocation._orientation) {
                tabSet._setWeight(this.getWeight() / 2);
                this._setWeight(this.getWeight() / 2);
                //console.log("added child 50% size at: " +  pos + dockLocation.indexPlus);
                parentRow._addChild(tabSet, pos + dockLocation._indexPlus);
            }
            else {
                // create a new row to host the new tabset (it will go in the opposite direction)
                //console.log("create a new row");
                const newRow = new RowNode(this._model, {});
                newRow._setWeight(this.getWeight());
                newRow._addChild(this);
                this._setWeight(50);
                tabSet._setWeight(50);
                //console.log("added child 50% size at: " +  dockLocation.indexPlus);
                newRow._addChild(tabSet, dockLocation._indexPlus);

                parentRow._removeChild(this);
                parentRow._addChild(newRow, pos);
            }
            this._model._setActiveTabset(tabSet);

        }
        this._model._tidy();

    }

    /** @hidden @internal */
    _toJson(): any {
        const json: any = {};
        TabSetNode._attributeDefinitions.toJson(json, this._attributes);
        json.children = this._children.map((child) => child._toJson());

        if (this.isActive()) {
            json.active = true;
        }

        if (this.isMaximized()) {
            json.maximized = true;
        }

        return json;
    }

    /** @hidden @internal */
    _updateAttrs(json: any) {
        TabSetNode._attributeDefinitions.update(json, this._attributes);
    }

    /** @hidden @internal */
    static _fromJson(json: any, model: Model) {
        const newLayoutNode = new TabSetNode(model, json);

        if (json.children != undefined) {
            json.children.forEach((jsonChild: any) => {
                const child = TabNode._fromJson(jsonChild, model);
                newLayoutNode._addChild(child);
            });
        }

        if (json.maximized && json.maximized === true) {
            model._setMaximizedTabset(newLayoutNode);
        }

        if (json.active && json.active === true) {
            model._setActiveTabset(newLayoutNode);
        }

        return newLayoutNode;
    }

    /** @hidden @internal */
    _getAttributeDefinitions() {
        return TabSetNode._attributeDefinitions;
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
    private static _createAttributeDefinitions(): AttributeDefinitions {

        let attributeDefinitions = new AttributeDefinitions();
        attributeDefinitions.add("type", TabSetNode.TYPE, true);
        attributeDefinitions.add("id", null).setType(Attribute.ID);

        attributeDefinitions.add("weight", 100);
        attributeDefinitions.add("width", null);
        attributeDefinitions.add("height", null);
        attributeDefinitions.add("selected", 0);
        attributeDefinitions.add("name", null).setType(Attribute.STRING);

        attributeDefinitions.addInherited("enableDeleteWhenEmpty", "tabSetEnableDeleteWhenEmpty");
        attributeDefinitions.addInherited("enableDrop", "tabSetEnableDrop");
        attributeDefinitions.addInherited("enableDrag", "tabSetEnableDrag");
        attributeDefinitions.addInherited("enableDivide", "tabSetEnableDivide");
        attributeDefinitions.addInherited("enableMaximize", "tabSetEnableMaximize");
        attributeDefinitions.addInherited("classNameTabStrip", "tabSetClassNameTabStrip");
        attributeDefinitions.addInherited("classNameHeader", "tabSetClassNameHeader");
        attributeDefinitions.addInherited("enableTabStrip", "tabSetEnableTabStrip");
        attributeDefinitions.addInherited("borderInsets", "tabSetBorderInsets");
        attributeDefinitions.addInherited("marginInsets", "tabSetMarginInsets");
        
        attributeDefinitions.addInherited("headerHeight", "tabSetHeaderHeight");
        attributeDefinitions.addInherited("tabStripHeight", "tabSetTabStripHeight");
        return attributeDefinitions;
    }
}

export default TabSetNode;