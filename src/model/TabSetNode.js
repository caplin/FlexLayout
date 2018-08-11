import Rect from "../Rect.js";
import AttributeDefinitions from "../AttributeDefinitions.js";
import Attribute from "../Attribute";
import DockLocation from "../DockLocation.js";
import DropInfo from "./../DropInfo.js";
import Node from "./Node.js";
import TabNode from "./TabNode.js";
import RowNode from "./RowNode.js";
import BorderNode from "./BorderNode.js";


class TabSetNode extends Node {

    constructor(model, json) {
        super(model);

        this._contentRect = null;
        this._headerRect = null;
        this._tabHeaderRect = null;

        attributeDefinitions.fromJson(json, this._attributes);
        model._addNode(this);
    }

    getName() {
        return this._attributes["name"];
    }

    getSelected() {
        return this._attributes["selected"];
    }

    getSelectedNode() {
        let selected = this.getSelected();
        if (selected != -1) {
            return this._children[selected];
        }
        return null;
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

    isMaximized() {
        return this._model.getMaximizedTabset() === this;
    }

    isMaximizeHidden() {
        let maximizedTabset = this._model.getMaximizedTabset();
        return maximizedTabset !== null && maximizedTabset !== this;
    }

    isActive() {
        return this._model.getActiveTabset() === this;
    }

    isEnableDeleteWhenEmpty() {
        return this._getAttr("enableDeleteWhenEmpty");
    }

    isEnableClose() {
        return this._getAttr("enableClose");
    }

    isEnableDrop() {
        return this._getAttr("enableDrop");
    }

    isEnableDrag() {
        return this._getAttr("enableDrag");
    }

    isEnableDivide() {
        return this._getAttr("enableDivide");
    }

    isEnableMaximize() {
        return this._getAttr("enableMaximize");
    }

    isEnableTabStrip() {
        return this._getAttr("enableTabStrip");
    }

    getClassNameTabStrip() {
        return this._getAttr("classNameTabStrip");
    }

    getClassNameHeader() {
        return this._getAttr("classNameHeader");
    }

    getHeaderHeight() {
        return this._getAttr("headerHeight");
    }

    getTabStripHeight() {
        return this._getAttr("tabStripHeight");
    }

    _setWeight(weight) {
        this._attributes["weight"] = weight;
    }

    _setSelected(index) {
        this._attributes["selected"] = index;
    }

    _canDrop(dragNode, x, y) {
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
            let child = this._children[0];
            let r = child._tabRect;
            const yy = r.y;
            const h = r.height;
            let p = this._tabHeaderRect.x;
            let childCenter = 0;
            for (let i = 0; i < this._children.length; i++) {
                child = this._children[i];
                r = child._tabRect;
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

    _layout(rect) {

        if (this.isMaximized()) {
            rect = this._model._root._rect;
        }
        const visible = !this.isMaximizeHidden();
        this._setVisible(visible);
        this._rect = rect;

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
            child._setVisible(visible && i === this.getSelected());
        });
    }

    _remove(node) {
        this._removeChild(node);
        this._model._tidy();
        this._setSelected(Math.max(0, this.getSelected() - 1));
    }

    _drop(dragNode, location, index) {
        const dockLocation = location;

        if (this === dragNode) { // tabset drop into itself
            return; // dock back to itself
        }

        let selectedNode = null;
        let fromIndex = 0;
        if (dragNode._parent != null) {
            selectedNode = dragNode._parent.getSelectedNode;
            fromIndex = dragNode._parent._removeChild(dragNode);
        }
        //console.log("removed child: " + fromIndex);

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
                dragNode._children.forEach((child, i) => {
                    this._addChild(child, insertPos);
                    //console.log("added child at : " + insertPos);
                    insertPos++;
                });
            }
            this._model._activeTabSet = this;

        }
        else {
            let tabSet = null;
            if (dragNode.getType() === TabNode.TYPE) {
                // create new tabset parent
                //console.log("create a new tabset");
                tabSet = new TabSetNode(this._model, {});
                tabSet._addChild(dragNode);
                //console.log("added child at end");
                dragNode._parent = tabSet;
            }
            else {
                tabSet = dragNode;
            }

            const parentRow = this._parent;
            const pos = parentRow._children.indexOf(this);

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
            this._model._activeTabSet = tabSet;

        }
        this._model._tidy();

    }

    _toJson() {
        const json = {};
        attributeDefinitions.toJson(json, this._attributes);
        json.children = this._children.map((child) => child._toJson());

        if (this.isActive()) {
            json.active = true;
        }

        if (this.isMaximized()) {
            json.maximized = true;
        }

        return json;
    }

    _updateAttrs(json) {
        attributeDefinitions.update(json, this._attributes);
    }

    static _fromJson(json, model) {
        const newLayoutNode = new TabSetNode(model, json);

        if (json.children != undefined) {
            json.children.forEach((jsonChild) => {
                const child = TabNode._fromJson(jsonChild, model);
                newLayoutNode._addChild(child);
            });
        }

        if (json.maximized && json.maximized == true) {
            model._setMaximizedTabset(newLayoutNode);
        }

        if (json.active && json.active == true) {
            model._setActiveTabset(newLayoutNode);
        }

        return newLayoutNode;
    }

    _getAttributeDefinitions() {
        return attributeDefinitions;
    }
}

TabSetNode.TYPE = "tabset";

let attributeDefinitions = new AttributeDefinitions();
attributeDefinitions.add("type", TabSetNode.TYPE, true);
attributeDefinitions.add("id", null).setType(Attribute.ID);

attributeDefinitions.add("weight", 100);
attributeDefinitions.add("width", null);
attributeDefinitions.add("height", null);
attributeDefinitions.add("selected", 0);
attributeDefinitions.add("name", null).setType(Attribute.STRING);

attributeDefinitions.addInherited("enableDeleteWhenEmpty", "tabSetEnableDeleteWhenEmpty");
attributeDefinitions.addInherited("enableClose", "tabSetEnableClose");
attributeDefinitions.addInherited("enableDrop", "tabSetEnableDrop");
attributeDefinitions.addInherited("enableDrag", "tabSetEnableDrag");
attributeDefinitions.addInherited("enableDivide", "tabSetEnableDivide");
attributeDefinitions.addInherited("enableMaximize", "tabSetEnableMaximize");
attributeDefinitions.addInherited("classNameTabStrip", "tabSetClassNameTabStrip");
attributeDefinitions.addInherited("classNameHeader", "tabSetClassNameHeader");
attributeDefinitions.addInherited("enableTabStrip", "tabSetEnableTabStrip");

attributeDefinitions.addInherited("headerHeight", "tabSetHeaderHeight");
attributeDefinitions.addInherited("tabStripHeight", "tabSetTabStripHeight");

export default TabSetNode;