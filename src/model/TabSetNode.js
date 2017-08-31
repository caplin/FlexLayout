import Rect from "../Rect.js";
import JsonConverter from "../JsonConverter.js";
import DockLocation from "../DockLocation.js";
import Orientation from "../Orientation.js";
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

        jsonConverter.fromJson(json, this);
        model._addNode(this);
    }

    getName() {
        return this._name;
    }

    getSelected() {
        return this._selected;
    }

    getSelectedNode() {
        if (this._selected != -1) {
            return this._children[this._selected];
        }
        return null;
    }

    isMaximized() {
        return this._model.getMaximizedTabset() === this;
    }

    isActive() {
        return this._model.getActiveTabset() === this;
    }

    isEnableClose() {
        return this._getAttr("_tabSetEnableClose");
    }

    isEnableDrop() {
        return this._getAttr("_tabSetEnableDrop");
    }

    isEnableDrag() {
        return this._getAttr("_tabSetEnableDrag");
    }

    isEnableDivide() {
        return this._getAttr("_tabSetEnableDivide");
    }

    isEnableMaximize() {
        return this._getAttr("_tabSetEnableMaximize");
    }

    isEnableTabStrip() {
        return this._getAttr("_tabSetEnableTabStrip");
    }

    getClassNameTabStrip() {
        return this._getAttr("_tabSetClassNameTabStrip");
    }

    getClassNameHeader() {
        return this._getAttr("_tabSetClassNameHeader");
    }

    getHeaderHeight() {
        return this._getAttr("_tabSetHeaderHeight");
    }

    getTabStripHeight() {
        return this._getAttr("_tabSetTabStripHeight");
    }

    _setSelected(index) {
        this._selected = index;
    }

    _setMaximized(maximized) {
        this._maximized = maximized;
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
            let yy = r.y;
            let h = r.height;
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
        this._rect = rect;

        let showHeader = (this._name != null);
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

        for (let i = 0; i < this._children.length; i++) {
            let child = this._children[i];
            child._layout(this._contentRect);
            child._setVisible(i === this._selected);
        }
    }

    _remove(node) {
        this._removeChild(node);
        this._model._tidy();
        this._selected = Math.max(0, this._selected - 1);
    }

    _drop(dragNode, location, index) {
        let dockLocation = location;

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
        if (dragNode._type === TabNode.TYPE && dragNode._parent === this && fromIndex < index && index > 0) {
            index--;
        }

        // for the tabset/border being removed from set the selected index
        if (dragNode._parent !== null) {
            if (dragNode._parent._type === TabSetNode.TYPE) {
                dragNode._parent._selected = 0;
            }
            else if (dragNode._parent._type === BorderNode.TYPE) {
                if (dragNode._parent._selected != -1) {
                    if (fromIndex === dragNode._parent._selected && dragNode._parent._children.length > 0) {
                        dragNode._parent._selected = 0;
                    }
                    else if (fromIndex < dragNode._parent._selected) {
                        dragNode._parent._selected--;
                    }
                    else if (fromIndex > dragNode._parent._selected) {
                        // leave selected index as is
                    }
                    else {
                        dragNode._parent._selected = -1;
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

            if (dragNode._type === TabNode.TYPE) {
                this._addChild(dragNode, insertPos);
                this._selected = insertPos;
                //console.log("added child at : " + insertPos);
            }
            else {
                for (let i = 0; i < dragNode._children.length; i++) {
                    this._addChild(dragNode._children[i], insertPos);
                    //console.log("added child at : " + insertPos);
                    insertPos++;
                }
            }
            this._model._activeTabSet = this;

        }
        else {
            let tabSet = null;
            if (dragNode._type === TabNode.TYPE) {
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

            let parentRow = this._parent;
            let pos = parentRow._children.indexOf(this);

            if (parentRow.getOrientation() === dockLocation._orientation) {
                tabSet._weight = this._weight / 2;
                this._weight = this._weight / 2;
                //console.log("added child 50% size at: " +  pos + dockLocation.indexPlus);
                parentRow._addChild(tabSet, pos + dockLocation._indexPlus);
            }
            else {
                // create a new row to host the new tabset (it will go in the opposite direction)
                //console.log("create a new row");
                let newRow = new RowNode(this._model, {});
                newRow._weight = this._weight;
                newRow._addChild(this);
                this._weight = 50;
                tabSet._weight = 50;
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
        let json = {};
        jsonConverter.toJson(json, this);
        json.children = [];
        for (let i = 0; i < this._children.length; i++) {
            let jsonChild = this._children[i]._toJson();
            json.children.push(jsonChild);
        }

        if (this.isActive()) {
            json.active = true;
        }

        if (this.isMaximized()) {
            json.maximized = true;
        }

        return json;
    }

    _updateAttrs(json) {
        jsonConverter.updateAttrs(json, this);
    }

    static _fromJson(json, model) {
        model._checkUniqueId(json);
        let newLayoutNode = new TabSetNode(model, json);

        if (json.children != undefined) {
            for (let i = 0; i < json.children.length; i++) {
                let child = TabNode._fromJson(json.children[i], model);
                newLayoutNode._addChild(child);
            }
        }

        if (json.maximized && json.maximized == true) {
            model._setMaximizedTabset(newLayoutNode);
        }

        if (json.active && json.active == true) {
            model._setActiveTabset(newLayoutNode);
        }

        return newLayoutNode;
    }

    //toAttributeString() {
    //    return jsonConverter.toTableValues(this);
    //}
}

TabSetNode.TYPE = "tabset";

let jsonConverter = new JsonConverter();
jsonConverter.addConversion("_type", "type", TabSetNode.TYPE, true);
jsonConverter.addConversion("_weight", "weight", 100);
jsonConverter.addConversion("_width", "width", null);
jsonConverter.addConversion("_height", "height", null);
jsonConverter.addConversion("_name", "name", null);
jsonConverter.addConversion("_selected", "selected", 0);
jsonConverter.addConversion("_id", "id", null);

jsonConverter.addConversion("_tabSetEnableClose", "enableClose", undefined);
jsonConverter.addConversion("_tabSetEnableDrop", "enableDrop", undefined);
jsonConverter.addConversion("_tabSetEnableDrag", "enableDrag", undefined);
jsonConverter.addConversion("_tabSetEnableDivide", "enableDivide", undefined);
jsonConverter.addConversion("_tabSetEnableMaximize", "enableMaximize", undefined);
jsonConverter.addConversion("_tabSetClassNameTabStrip", "classNameTabStrip", undefined);
jsonConverter.addConversion("_tabSetClassNameHeader", "classNameHeader", undefined);
jsonConverter.addConversion("_tabSetEnableTabStrip", "enableTabStrip", undefined);

jsonConverter.addConversion("_tabSetHeaderHeight", "headerHeight", undefined);
jsonConverter.addConversion("_tabSetTabStripHeight", "tabStripHeight", undefined);

export default TabSetNode;