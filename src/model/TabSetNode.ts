import Attribute from "../Attribute";
import AttributeDefinitions from "../AttributeDefinitions";
import DockLocation from "../DockLocation";
import DropInfo from "../DropInfo";
import Orientation from "../Orientation";
import Rect from "../Rect";
import BorderNode from "./BorderNode";
import IDraggable from "./IDraggable";
import IDropTarget from "./IDropTarget";
import Model, { ILayoutMetrics } from "./Model";
import Node from "./Node";
import RowNode from "./RowNode";
import TabNode from "./TabNode";
import { adjustSelectedIndex } from "./Utils";

class TabSetNode extends Node implements IDraggable, IDropTarget {
    static readonly TYPE = "tabset";

    /** @hidden @internal */
    static _fromJson(json: any, model: Model) {
        const newLayoutNode = new TabSetNode(model, json);

        if (json.children != null) {
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
    private static _attributeDefinitions: AttributeDefinitions = TabSetNode._createAttributeDefinitions();

    /** @hidden @internal */
    private static _createAttributeDefinitions(): AttributeDefinitions {
        const attributeDefinitions = new AttributeDefinitions();
        attributeDefinitions.add("type", TabSetNode.TYPE, true).setType(Attribute.STRING).setFixed();
        attributeDefinitions.add("id", undefined).setType(Attribute.STRING);

        attributeDefinitions.add("weight", 100).setType(Attribute.NUMBER);
        attributeDefinitions.add("width", undefined).setType(Attribute.NUMBER);
        attributeDefinitions.add("height", undefined).setType(Attribute.NUMBER);
        attributeDefinitions.add("selected", 0).setType(Attribute.NUMBER);
        attributeDefinitions.add("name", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("config", undefined).setType("any");

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
        attributeDefinitions.addInherited("minWidth", "tabSetMinWidth");
        attributeDefinitions.addInherited("minHeight", "tabSetMinHeight");

        attributeDefinitions.addInherited("headerHeight", "tabSetHeaderHeight");
        attributeDefinitions.addInherited("tabStripHeight", "tabSetTabStripHeight");
        attributeDefinitions.addInherited("tabLocation", "tabSetTabLocation");
        attributeDefinitions.addInherited("autoSelectTab", "tabSetAutoSelectTab").setType(Attribute.BOOLEAN);
        return attributeDefinitions;
    }

    /** @hidden @internal */
    private _contentRect?: Rect;
    /** @hidden @internal */
    private _tabHeaderRect?: Rect;
    /** @hidden @internal */
    private calculatedTabBarHeight: number;
    /** @hidden @internal */
    private calculatedHeaderBarHeight: number;

    /** @hidden @internal */
    constructor(model: Model, json: any) {
        super(model);

        TabSetNode._attributeDefinitions.fromJson(json, this._attributes);
        model._addNode(this);
        this.calculatedTabBarHeight = 0;
        this.calculatedHeaderBarHeight = 0;
    }

    getName() {
        return this._getAttr("name") as string | undefined;
    }

    getSelected() {
        const selected = this._attributes.selected;
        if (selected !== undefined) {
            return selected as number;
        }
        return -1;
    }

    getSelectedNode() {
        const selected = this.getSelected();
        if (selected !== -1) {
            return this._children[selected];
        }
        return undefined;
    }

    getWeight(): number {
        return this._getAttr("weight") as number;
    }

    getWidth() {
        return this._getAttr("width") as number | undefined;
    }

    getMinWidth() {
        return this._getAttr("minWidth") as number;
    }

    getHeight() {
        return this._getAttr("height") as number | undefined;
    }

    getMinHeight() {
        return this._getAttr("minHeight") as number;
    }

    /** @hidden @internal */
    getMinSize(orientation: Orientation) {
        if (orientation === Orientation.HORZ) {
            return this.getMinWidth();
        } else {
            return this.getMinHeight();
        }
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

    canMaximize() {
        if (this.isEnableMaximize()) {
            // always allow maximize toggle if already maximized
            if (this.getModel().getMaximizedTabset() === this) {
                return true;
            }
            // only one tabset, so disable
            if (this.getParent() === this.getModel().getRoot() && this.getModel().getRoot().getChildren().length === 1) {
                return false;
            }
            return true;
        }
        return false;
    }

    isEnableTabStrip() {
        return this._getAttr("enableTabStrip") as boolean;
    }

    isAutoSelectTab() {
        return this._getAttr("autoSelectTab") as boolean;
    }

    getClassNameTabStrip() {
        return this._getAttr("classNameTabStrip") as string | undefined;
    }

    getClassNameHeader() {
        return this._getAttr("classNameHeader") as string | undefined;
    }

    /** @hidden @internal */
    calculateHeaderBarHeight(metrics: ILayoutMetrics) {
        const headerBarHeight = this._getAttr("headerHeight") as number;
        if (headerBarHeight !== 0) {
            // its defined
            this.calculatedHeaderBarHeight = headerBarHeight;
        } else {
            this.calculatedHeaderBarHeight = metrics.headerBarSize;
        }
    }

    /** @hidden @internal */
    calculateTabBarHeight(metrics: ILayoutMetrics) {
        const tabBarHeight = this._getAttr("tabStripHeight") as number;
        if (tabBarHeight !== 0) {
            // its defined
            this.calculatedTabBarHeight = tabBarHeight;
        } else {
            this.calculatedTabBarHeight = metrics.tabBarSize;
        }
    }

    getHeaderHeight() {
        return this.calculatedHeaderBarHeight;
    }

    getTabStripHeight() {
        return this.calculatedTabBarHeight;
    }

    getTabLocation() {
        return this._getAttr("tabLocation") as string;
    }

    /** @hidden @internal */
    _setWeight(weight: number) {
        this._attributes.weight = weight;
    }

    /** @hidden @internal */
    _setSelected(index: number) {
        this._attributes.selected = index;
    }

    /** @hidden @internal */
    canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
        let dropInfo;

        if (dragNode === this) {
            const dockLocation = DockLocation.CENTER;
            const outlineRect = this._tabHeaderRect;
            dropInfo = new DropInfo(this, outlineRect!, dockLocation, -1, "flexlayout__outline_rect");
        } else if (this._contentRect!.contains(x, y)) {
            const dockLocation = DockLocation.getLocation(this._contentRect!, x, y);
            const outlineRect = dockLocation.getDockRect(this._rect);
            dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect");
        } else if (this._children.length > 0 && this._tabHeaderRect != null && this._tabHeaderRect.contains(x, y)) {
            let child = this._children[0] as TabNode;
            let r = child.getTabRect()!;
            const yy = r.y;
            const h = r.height;
            let p = this._tabHeaderRect.x;
            let childCenter = 0;
            for (let i = 0; i < this._children.length; i++) {
                child = this._children[i] as TabNode;
                r = child.getTabRect()!;
                childCenter = r.x + r.width / 2;
                if (x >= p && x < childCenter) {
                    const dockLocation = DockLocation.CENTER;
                    const outlineRect = new Rect(r.x - 2, yy, 3, h);
                    dropInfo = new DropInfo(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
                    break;
                }
                p = childCenter;
            }
            if (dropInfo == null) {
                const dockLocation = DockLocation.CENTER;
                const outlineRect = new Rect(r.getRight() - 2, yy, 3, h);
                dropInfo = new DropInfo(this, outlineRect, dockLocation, this._children.length, "flexlayout__outline_rect");
            }
        }

        if (!dragNode._canDockInto(dragNode, dropInfo)) {
            return undefined;
        }

        return dropInfo;
    }

    /** @hidden @internal */
    _layout(rect: Rect, metrics: ILayoutMetrics) {
        this.calculateHeaderBarHeight(metrics);
        this.calculateTabBarHeight(metrics);

        if (this.isMaximized()) {
            rect = (this._model.getRoot() as Node).getRect();
        }

        rect = rect.removeInsets(this._getAttr("marginInsets"));
        this._rect = rect;
        rect = rect.removeInsets(this._getAttr("borderInsets"));

        const showHeader = this.getName() !== undefined;
        let y = 0;
        let h = 0;
        if (showHeader) {
            y += this.calculatedHeaderBarHeight;
            h += this.calculatedHeaderBarHeight;
        }
        if (this.isEnableTabStrip()) {
            if (this.getTabLocation() === "top") {
                this._tabHeaderRect = new Rect(rect.x, rect.y + y, rect.width, this.calculatedTabBarHeight);
            } else {
                this._tabHeaderRect = new Rect(rect.x, rect.y + rect.height - this.calculatedTabBarHeight, rect.width, this.calculatedTabBarHeight);
            }
            h += this.calculatedTabBarHeight;
            if (this.getTabLocation() === "top") {
                y += this.calculatedTabBarHeight;
            }
        }
        this._contentRect = new Rect(rect.x, rect.y + y, rect.width, rect.height - h);

        this._children.forEach((child, i) => {
            child._layout(this._contentRect!, metrics);
            child._setVisible(i === this.getSelected());
        });
    }

    /** @hidden @internal */
    _remove(node: TabNode) {
        const removedIndex = this._removeChild(node);
        this._model._tidy();

        adjustSelectedIndex(this, removedIndex);
    }

    /** @hidden @internal */
    drop(dragNode: Node & IDraggable, location: DockLocation, index: number, select?: boolean) {
        const dockLocation = location;

        if (this === dragNode) {
            // tabset drop into itself
            return; // dock back to itself
        }

        let dragParent = dragNode.getParent() as BorderNode | TabSetNode | RowNode;
        let fromIndex = 0;
        if (dragParent !== undefined) {
            fromIndex = dragParent._removeChild(dragNode);
            adjustSelectedIndex(dragParent, fromIndex);
        }

        // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
        if (dragNode.getType() === TabNode.TYPE && dragParent === this && fromIndex < index && index > 0) {
            index--;
        }

        // simple_bundled dock to existing tabset
        if (dockLocation === DockLocation.CENTER) {
            let insertPos = index;
            if (insertPos === -1) {
                insertPos = this._children.length;
            }

            if (dragNode.getType() === TabNode.TYPE) {
                this._addChild(dragNode, insertPos);
                if (select || (select !== false && this.isAutoSelectTab())) {
                    this._setSelected(insertPos);
                }
                // console.log("added child at : " + insertPos);
            } else {
                dragNode.getChildren().forEach((child, i) => {
                    this._addChild(child, insertPos);
                    // console.log("added child at : " + insertPos);
                    insertPos++;
                });
            }
            this._model._setActiveTabset(this);
        } else {
            let tabSet: TabSetNode | undefined;
            if (dragNode instanceof TabNode) {
                // create new tabset parent
                // console.log("create a new tabset");
                const callback = this._model._getOnCreateTabSet();
                tabSet = new TabSetNode(this._model, callback ? callback(dragNode as TabNode) : {});
                tabSet._addChild(dragNode);
                // console.log("added child at end");
                dragParent = tabSet;
            } else {
                tabSet = dragNode as TabSetNode;
            }

            const parentRow = this._parent as Node;
            const pos = parentRow.getChildren().indexOf(this);

            if (parentRow.getOrientation() === dockLocation._orientation) {
                tabSet._setWeight(this.getWeight() / 2);
                this._setWeight(this.getWeight() / 2);
                // console.log("added child 50% size at: " +  pos + dockLocation.indexPlus);
                parentRow._addChild(tabSet, pos + dockLocation._indexPlus);
            } else {
                // create a new row to host the new tabset (it will go in the opposite direction)
                // console.log("create a new row");
                const newRow = new RowNode(this._model, {});
                newRow._setWeight(this.getWeight());
                newRow._addChild(this);
                this._setWeight(50);
                tabSet._setWeight(50);
                // console.log("added child 50% size at: " +  dockLocation.indexPlus);
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
    static getAttributeDefinitions() {
        return TabSetNode._attributeDefinitions;
    }

}

export default TabSetNode;
