import { Attribute } from "./Attributes";
import { Attributes } from "./Attributes";
import { DockLocation } from "./DockLocation";
import { DropInfo } from "./DropInfo";
import { Rect } from "./Rect";
import { CLASSES } from "../view/CSSClassNames";
import { canDockToLayout } from "../view/Utils";
import { BorderNode } from "./BorderNode";
import { IDraggable } from "./IDraggable";
import { IDropTarget } from "./IDropTarget";
import { IJsonTabSetNode, ITabSetAttributes } from "./IJsonModel";
import { Layout } from "./Layout";
import { Model } from "./Model";
import { Node } from "./Node";
import { RowNode } from "./RowNode";
import { TabNode } from "./TabNode";
import { adjustSelectedIndex, adjustSelectedIndexAfterInsert } from "./Utils";

export class TabSetNode extends Node implements IDraggable, IDropTarget {
    static readonly TYPE = "tabset";

    /** @internal */
    static fromJson(json: IJsonTabSetNode, model: Model, layout: Layout) {
        const newLayoutNode = new TabSetNode(model, json);

        if (json.children != null) {
            for (const jsonChild of json.children) {
                const child = TabNode.fromJson(jsonChild, model);
                newLayoutNode.addChild(child);
            }
        }
        if (newLayoutNode.children.length === 0) {
            newLayoutNode.setSelected(-1);
        } else if (newLayoutNode.getSelected() >= newLayoutNode.children.length) {
            // clamp an out of range selected index from the json
            newLayoutNode.setSelected(newLayoutNode.children.length - 1);
        }

        if (json.maximized && json.maximized === true) {
            layout.setMaximizedTabSet(newLayoutNode);
        }

        if (json.active && json.active === true) {
            layout.setActiveTabSet(newLayoutNode);
        }

        return newLayoutNode;
    }
    private static attributeDefinitions: Attributes = TabSetNode.createAttributeDefinitions();

    private tabStripRect: Rect = Rect.empty();
    private contentRect: Rect = Rect.empty();
    private calculatedMinHeight: number;
    private calculatedMinWidth: number;
    private calculatedMaxHeight: number;
    private calculatedMaxWidth: number;

    /** @internal */
    constructor(model: Model, json: IJsonTabSetNode) {
        super(model);
        this.calculatedMinHeight = 0;
        this.calculatedMinWidth = 0;
        this.calculatedMaxHeight = 0;
        this.calculatedMaxWidth = 0;

        TabSetNode.attributeDefinitions.fromJson(json, this.attributes);
        model.addNode(this);
    }

    getName() {
        return this.getAttr("name") as string | undefined;
    }

    isEnableActiveIcon() {
        return this.getAttr("enableActiveIcon") as boolean;
    }

    getSelected() {
        const selected = this.attributes.selected;
        if (selected !== undefined) {
            return selected as number;
        }
        return -1;
    }

    getSelectedNode() {
        const selected = this.getSelected();
        if (selected !== -1) {
            return this.children[selected];
        }
        return undefined;
    }

    /** @internal */
    getPinnedRunLength() {
        // number of leading contiguous pinned tabs
        let n = 0;
        for (const child of this.children) {
            if ((child as TabNode).isPinned()) {
                n++;
            } else {
                break;
            }
        }
        return n;
    }

    getWeight(): number {
        return this.getAttr("weight") as number;
    }

    getAttrMinWidth() {
        return this.getAttr("minWidth") as number;
    }

    getAttrMinHeight() {
        return this.getAttr("minHeight") as number;
    }

    getMinWidth() {
        return this.calculatedMinWidth;
    }

    getMinHeight() {
        return this.calculatedMinHeight;
    }
    getAttrMaxWidth() {
        return this.getAttr("maxWidth") as number;
    }

    getAttrMaxHeight() {
        return this.getAttr("maxHeight") as number;
    }

    getMaxWidth() {
        return this.calculatedMaxWidth;
    }

    getMaxHeight() {
        return this.calculatedMaxHeight;
    }

    isCloseable() {
        let closeable = this.isEnableClose();
        if (closeable) {
            closeable = super.isCloseable();
        }

        return closeable;
    }

    /**
     * Returns the config attribute that can be used to store node specific data that
     * WILL be saved to the json. The config attribute should be changed via the action Actions.updateNodeAttributes rather
     * than directly, for example:
     * this.state.model.doAction(
     *   FlexLayout.Actions.updateNodeAttributes(node.getId(), {config:myConfigObject}));
     */
    getConfig() {
        return this.attributes.config;
    }

    isMaximized() {
        return this.model.getMaximizedTabset(this.getLayoutId()) === this;
    }

    isActive() {
        return this.model.getActiveTabset(this.getLayoutId()) === this;
    }

    isEnableDeleteWhenEmpty() {
        return this.getAttr("enableDeleteWhenEmpty") as boolean;
    }

    isEnableDrop() {
        return this.getAttr("enableDrop") as boolean;
    }

    isEnableTabStrip() {
        return this.getAttr("enableTabStrip") as boolean;
    }

    isEnableTabWrap() {
        return this.getAttr("enableTabWrap") as boolean;
    }

    isEnableDrag() {
        return this.getAttr("enableDrag") as boolean;
    }

    isEnableDivide() {
        return this.getAttr("enableDivide") as boolean;
    }

    isEnableMaximize() {
        return this.getAttr("enableMaximize") as boolean;
    }

    isEnableClose() {
        return this.getAttr("enableClose") as boolean;
    }

    isEnableCloseButton() {
        return this.getAttr("enableCloseButton") as boolean;
    }

    isEnableSingleTabStretch() {
        return this.getAttr("enableSingleTabStretch") as boolean;
    }

    isAutoSelectTab() {
        return this.getAttr("autoSelectTab") as boolean;
    }

    isEnableTabScrollbar() {
        return this.getAttr("enableTabScrollbar") as boolean;
    }

    getClassNameTabStrip() {
        return this.getAttr("classNameTabStrip") as string | undefined;
    }

    getTabLocation() {
        return this.getAttr("tabLocation") as string;
    }

    toJson(): IJsonTabSetNode {
        const json: any = {};
        TabSetNode.attributeDefinitions.toJson(json, this.attributes);
        json.children = this.children.map((child) => child.toJson());

        if (this.isActive()) {
            json.active = true;
        }

        if (this.isMaximized()) {
            json.maximized = true;
        }

        return json;
    }

    /** @internal */
    calcMinMaxSize() {
        this.calculatedMinHeight = this.getAttrMinHeight();
        this.calculatedMinWidth = this.getAttrMinWidth();
        this.calculatedMaxHeight = this.getAttrMaxHeight();
        this.calculatedMaxWidth = this.getAttrMaxWidth();
        for (const child of this.children) {
            const c = child as TabNode;
            this.calculatedMinWidth = Math.max(this.calculatedMinWidth, c.getMinWidth());
            this.calculatedMinHeight = Math.max(this.calculatedMinHeight, c.getMinHeight());
            this.calculatedMaxWidth = Math.min(this.calculatedMaxWidth, c.getMaxWidth());
            this.calculatedMaxHeight = Math.min(this.calculatedMaxHeight, c.getMaxHeight());
        }

        this.calculatedMinHeight += this.tabStripRect.height;
        this.calculatedMaxHeight += this.tabStripRect.height;

        // contradictory attributes (e.g. a tab with maxWidth < minWidth) can drive the calculated
        // max below the min; keep max >= min so getSplitterBounds / calculateSplit are not fed
        // inverted bounds
        this.calculatedMaxWidth = Math.max(this.calculatedMaxWidth, this.calculatedMinWidth);
        this.calculatedMaxHeight = Math.max(this.calculatedMaxHeight, this.calculatedMinHeight);
    }

    /** @internal */
    canMaximize() {
        if (this.isEnableMaximize()) {
            // always allow maximize toggle if already maximized
            if (this.getModel().getMaximizedTabset(this.getLayoutId()) === this) {
                return true;
            }
            // only one tabset, so disable
            if (this.getParent() === this.getModel().getRootRow(this.getLayoutId()) && this.getModel().getRootRow(this.getLayoutId())!.getChildren().length === 1) {
                return false;
            }
            return true;
        }
        return false;
    }

    /** @internal */
    setContentRect(rect: Rect) {
        this.contentRect = rect;
    }

    /** @internal */
    getContentRect() {
        return this.contentRect;
    }

    /** @internal */
    setTabStripRect(rect: Rect) {
        this.tabStripRect = rect;
    }

    /** @internal */
    getTabStripRect() {
        return this.tabStripRect;
    }
    /** @internal */
    setWeight(weight: number) {
        this.attributes.weight = weight;
    }

    /** @internal */
    setSelected(index: number) {
        this.attributes.selected = index;
    }

    /** @internal */
    canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
        let dropInfo;
        const layout = this.getLayout();

        if (dragNode === this) {
            const dockLocation = DockLocation.CENTER;
            const outlineRect = this.tabStripRect;
            dropInfo = new DropInfo(this, outlineRect!, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
        } else if (this.getLayoutId() !== Model.MAIN_LAYOUT_ID && !canDockToLayout(dragNode, layout!)) {
            return undefined;
        } else if (this.contentRect!.contains(x, y)) {
            let dockLocation = DockLocation.CENTER;
            if (this.model.getMaximizedTabset(this.getLayoutId()) === undefined) {
                dockLocation = DockLocation.getLocation(this.contentRect!, x, y);
            }
            const outlineRect = dockLocation.getDockRect(this.rect);
            dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
        } else if (this.tabStripRect != null && this.tabStripRect.contains(x, y)) {
            let r: Rect;
            let yy: number;
            let h: number;
            if (this.children.length === 0) {
                r = this.tabStripRect.clone();
                yy = r.y + 3;
                h = r.height - 4;
                r.width = 2;
            } else {
                let child = this.children[0] as TabNode;
                r = child.getTabRect()!;
                yy = r.y;
                h = r.height;
                let p = this.tabStripRect.x;
                for (let i = 0; i < this.children.length; i++) {
                    child = this.children[i] as TabNode;
                    r = child.getTabRect()!;
                    if (r.y !== yy) {
                        yy = r.y;
                        p = this.tabStripRect.x;
                    }
                    const childCenter = r.x + r.width / 2;
                    if (p <= x && x < childCenter && r.y < y && y < r.getBottom()) {
                        const dockLocation = DockLocation.CENTER;
                        const outlineRect = new Rect(r.x - 2, r.y, 3, r.height);
                        if (this.rect.x < r.x && r.x < this.rect.getRight()) {
                            dropInfo = new DropInfo(this, outlineRect, dockLocation, i, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
                            break;
                        } else {
                            return undefined;
                        }
                    }
                    p = childCenter;
                }
            }
            if (dropInfo == null && r.getRight() < this.rect!.getRight()) {
                const dockLocation = DockLocation.CENTER;
                const outlineRect = new Rect(r.getRight() - 2, yy, 3, h);
                dropInfo = new DropInfo(this, outlineRect, dockLocation, this.children.length, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
            }
        }

        // clamp tabstrip drops to the pinned/unpinned boundary: a pinned tab can only drop within
        // the pinned group, anything else can only drop after it
        if (dropInfo !== undefined && dropInfo.index !== -1 && this.children.length > 0) {
            const run = this.getPinnedRunLength();
            const pinnedDrag = dragNode instanceof TabNode && dragNode.isPinned();
            const clamped = pinnedDrag ? Math.min(dropInfo.index, run) : Math.max(dropInfo.index, run);
            if (clamped !== dropInfo.index) {
                // reposition the outline to the boundary (using the boundary child's own tab rect
                // keeps the outline on the correct row in tab wrap mode)
                let r: Rect;
                if (clamped < this.children.length) {
                    const cr = (this.children[clamped] as TabNode).getTabRect()!;
                    r = new Rect(cr.x - 2, cr.y, 3, cr.height);
                } else {
                    const cr = (this.children[this.children.length - 1] as TabNode).getTabRect()!;
                    r = new Rect(cr.getRight() - 2, cr.y, 3, cr.height);
                }
                dropInfo = new DropInfo(this, r, DockLocation.CENTER, clamped, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
            }
        }

        if (!this.canDockInto(dragNode, dropInfo)) {
            return undefined;
        }

        return dropInfo;
    }

    /** @internal */
    delete() {
        const layoutId = this.getLayoutId();
        (this.parent as RowNode).removeChild(this);
        if (this === this.model.getMaximizedTabset(layoutId)) {
            this.model.setMaximizedTabset(undefined, layoutId);
        }
    }

    /** @internal */
    remove(node: TabNode) {
        const removedIndex = this.removeChild(node);
        this.model.tidy();

        adjustSelectedIndex(this, removedIndex);
    }

    /** @internal */
    drop(dragNode: Node, location: DockLocation, index: number, select?: boolean) {
        const dockLocation = location;

        if (this === dragNode) {
            // tabset drop into itself
            return; // dock back to itself
        }

        const dragParent = dragNode.getParent() as BorderNode | TabSetNode | RowNode;
        let fromIndex = 0;
        if (dragParent !== undefined) {
            fromIndex = dragParent.removeChild(dragNode);
            // if selected node in border is being docked into tabset then deselect border tabs
            if (dragParent instanceof BorderNode && dragParent.getSelected() === fromIndex) {
                dragParent.setSelected(-1);
            } else {
                adjustSelectedIndex(dragParent, fromIndex);
            }
        }

        // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
        if (dragNode instanceof TabNode && dragParent === this && fromIndex < index && index > 0) {
            index--;
        }

        // simple_bundled dock to existing tabset
        if (dockLocation === DockLocation.CENTER) {
            let insertPos = index;
            if (insertPos === -1) {
                insertPos = this.children.length;
            }

            // keep pinned tabs grouped at the start (also covers programmatic moveNode/addTab)
            const pinnedRun = this.getPinnedRunLength(); // dragNode already removed from its parent
            if (dragNode instanceof TabNode) {
                insertPos = dragNode.isPinned() ? Math.min(insertPos, pinnedRun) : Math.max(insertPos, pinnedRun);
            } else {
                insertPos = Math.max(insertPos, pinnedRun); // tabset/row merges insert after the pinned group
            }

            if (dragNode instanceof TabNode) {
                this.addChild(dragNode, insertPos);
                if (select || (select !== false && this.isAutoSelectTab())) {
                    this.setSelected(insertPos);
                } else {
                    adjustSelectedIndexAfterInsert(this, insertPos);
                }
            } else if (dragNode instanceof RowNode) {
                const firstInsertPos = insertPos;
                (dragNode as RowNode).forEachNode((child, _level) => {
                    if (child instanceof TabNode) {
                        this.addChild(child, insertPos);
                        insertPos++;
                    }
                }, 0);
                adjustSelectedIndexAfterInsert(this, firstInsertPos, insertPos - firstInsertPos);
            } else {
                const firstInsertPos = insertPos;
                for (let i = 0; i < dragNode.getChildren().length; i++) {
                    const child = dragNode.getChildren()[i];
                    this.addChild(child, insertPos);
                    insertPos++;
                }
                adjustSelectedIndexAfterInsert(this, firstInsertPos, insertPos - firstInsertPos);
                if (this.getSelected() === -1 && this.children.length > 0) {
                    this.setSelected(0);
                }
            }
            this.model.setActiveTabset(this, this.parent!.getLayoutId());
        } else {
            let moveNode = dragNode as TabSetNode | RowNode | TabNode;
            if (dragNode instanceof TabNode) {
                // create new tabset parent
                const callback = this.model.getOnCreateTabSet();
                moveNode = new TabSetNode(this.model, callback ? callback(dragNode as TabNode) : {});
                moveNode.addChild(dragNode);
            } else if (dragNode instanceof RowNode) {
                const parent = this.getParent()! as RowNode;
                // need to turn round if same orientation unless docking oposite direction
                if (dragNode.getOrientation() === parent.getOrientation() && (location.getOrientation() === parent.getOrientation() || location === DockLocation.CENTER)) {
                    const node = new RowNode(this.model, {});
                    node.addChild(dragNode);
                    moveNode = node;
                }
            } else {
                moveNode = dragNode as TabSetNode;
            }

            const parentRow = this.parent as Node;
            const pos = parentRow.getChildren().indexOf(this);

            if (parentRow.getOrientation() === dockLocation.orientation) {
                moveNode.setWeight(this.getWeight() / 2);
                this.setWeight(this.getWeight() / 2);
                parentRow.addChild(moveNode, pos + dockLocation.indexPlus);
            } else {
                // create a new row to host the new tabset (it will go in the opposite direction)
                const newRow = new RowNode(this.model, {});
                newRow.setWeight(this.getWeight());
                newRow.addChild(this);
                this.setWeight(50);
                moveNode.setWeight(50);
                newRow.addChild(moveNode, dockLocation.indexPlus);

                parentRow.removeChild(this);
                parentRow.addChild(newRow, pos);
            }
            if (moveNode instanceof TabSetNode) {
                this.model.setActiveTabset(moveNode, this.getLayoutId());
            }
        }
        this.model.tidy();
    }

    /** @internal */
    updateAttrs(json: ITabSetAttributes) {
        TabSetNode.attributeDefinitions.update(json, this.attributes);
    }

    /** @internal */
    getAttributeDefinitions() {
        return TabSetNode.attributeDefinitions;
    }

    /** @internal */
    static getAttributeDefinitions() {
        return TabSetNode.attributeDefinitions;
    }

    /** @internal */
    private static createAttributeDefinitions(): Attributes {
        const attributeDefinitions = new Attributes();
        attributeDefinitions.add("type", TabSetNode.TYPE, true).setType(Attribute.STRING).setFixed();
        attributeDefinitions.add("id", undefined).setType(Attribute.STRING).setDescription(`the unique id of the tab set, if left undefined a uuid will be assigned`);
        attributeDefinitions.add("weight", 100).setType(Attribute.NUMBER).setDescription(`relative weight for sizing of this tabset in parent row`);
        attributeDefinitions.add("selected", 0).setType(Attribute.NUMBER).setDescription(`index of selected/visible tab in tabset`);
        attributeDefinitions.add("name", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("config", undefined).setType("any").setDescription(`a place to hold json config used in your own code`);

        attributeDefinitions.addInherited("enableDeleteWhenEmpty", "tabSetEnableDeleteWhenEmpty").setDescription(`whether to delete this tabset when is has no tabs`);
        attributeDefinitions.addInherited("enableDrop", "tabSetEnableDrop").setDescription(`allow user to drag tabs into this tabset`);
        attributeDefinitions.addInherited("enableDrag", "tabSetEnableDrag").setDescription(`allow user to drag tabs out this tabset`);
        attributeDefinitions.addInherited("enableDivide", "tabSetEnableDivide").setDescription(`allow user to drag tabs to region of this tabset, splitting into new tabset`);
        attributeDefinitions.addInherited("enableMaximize", "tabSetEnableMaximize").setDescription(`allow user to maximize tabset to fill view via maximize button`);
        attributeDefinitions.addInherited("enableClose", "tabSetEnableClose").setDescription(`can this tabset be closed`);
        attributeDefinitions.addInherited("enableCloseButton", "tabSetEnableCloseButton").setDescription(`if the tabset can be closed then show a close button`);
        attributeDefinitions
            .addInherited("enableSingleTabStretch", "tabSetEnableSingleTabStretch")
            .setDescription(`if the tabset has only a single tab then stretch the single tab to fill area and display in a header style`);

        attributeDefinitions.addInherited("classNameTabStrip", "tabSetClassNameTabStrip").setDescription(`a class name to apply to the tab strip`);
        attributeDefinitions.addInherited("enableTabStrip", "tabSetEnableTabStrip").setDescription(`enable tab strip and allow multiple tabs in this tabset`);
        attributeDefinitions.addInherited("minWidth", "tabSetMinWidth").setDescription(`minimum width (in px) for this tabset`);
        attributeDefinitions.addInherited("minHeight", "tabSetMinHeight").setDescription(`minimum height (in px) for this tabset`);
        attributeDefinitions.addInherited("maxWidth", "tabSetMaxWidth").setDescription(`maximum width (in px) for this tabset`);
        attributeDefinitions.addInherited("maxHeight", "tabSetMaxHeight").setDescription(`maximum height (in px) for this tabset`);

        attributeDefinitions.addInherited("enableTabWrap", "tabSetEnableTabWrap").setDescription(`wrap tabs onto multiple lines`);
        attributeDefinitions.addInherited("tabLocation", "tabSetTabLocation").setDescription(`the location of the tabs either top or bottom`);
        attributeDefinitions.addInherited("autoSelectTab", "tabSetAutoSelectTab").setType(Attribute.BOOLEAN).setDescription(`whether to select new/moved tabs in tabset`);
        attributeDefinitions
            .addInherited("enableActiveIcon", "tabSetEnableActiveIcon")
            .setType(Attribute.BOOLEAN)
            .setDescription(`whether the active icon (*) should be displayed when the tabset is active`);

        attributeDefinitions.addInherited("enableTabScrollbar", "tabSetEnableTabScrollbar").setType(Attribute.BOOLEAN).setDescription(`whether to show a mini scrollbar for the tabs`);

        return attributeDefinitions;
    }
}
