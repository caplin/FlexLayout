import { Attribute } from "./Attributes";
import { Attributes } from "./Attributes";
import { DockLocation } from "./DockLocation";
import { DropInfo } from "./DropInfo";
import { Rect } from "./Rect";
import { CLASSES } from "../CSSClassNames";
import { IDraggable } from "./IDraggable";
import { IDropTarget } from "./IDropTarget";
import { IJsonTabGroupNode, IJsonTabSetNode, ITabSetAttributes } from "./IJsonModel";
import { ModelLayout } from "./ModelLayout";
import { TabGroupNode } from "./TabGroupNode";
import { Model } from "./Model";
import { Node } from "./Node";
import { RowNode } from "./RowNode";
import { findStripDrop } from "./StripDrop";
import { TabNode } from "./TabNode";
import { adjustSelectedIndex, adjustSelectedIndexAfterInsert, detachDragNode, isInSubtree, restoreSelectionAfterInsert } from "./Utils";
import { validPreferredSize } from "./Sizing";
import { Orientation } from "./Orientation";

export class TabSetNode extends Node implements IDraggable, IDropTarget {
    static readonly TYPE = "tabset";

    /** @internal */
    static fromJson(json: IJsonTabSetNode, model: Model, layout: ModelLayout) {
        const newLayoutNode = new TabSetNode(model, json);

        if (json.children != null) {
            for (const jsonChild of json.children) {
                if (jsonChild.type === TabGroupNode.TYPE) {
                    const child = TabGroupNode.fromJson(jsonChild as IJsonTabGroupNode, model);
                    newLayoutNode.addChild(child);
                } else if (jsonChild.type === TabNode.TYPE || jsonChild.type === undefined) {
                    // a missing type defaults to tab for backwards compatibility with hand built json
                    const child = TabNode.fromJson(jsonChild, model);
                    newLayoutNode.addChild(child);
                } else {
                    // reject rather than silently dropping malformed json content
                    throw new Error(`Error: invalid tabset child type "${jsonChild.type}" (expected "tab" or "tabgroup")`);
                }
            }
        }
        if (newLayoutNode.children.length === 0) {
            newLayoutNode.setSelected(-1);
        } else if (newLayoutNode.getSelected() >= newLayoutNode.getTabNodes().length) {
            // clamp out-of-range selected index from json to prevent children[selected] crash
            newLayoutNode.setSelected(newLayoutNode.getTabNodes().length - 1);
        } else if (newLayoutNode.getSelected() < -1) {
            newLayoutNode.setSelected(-1);
        }

        if (json.maximized && json.maximized === true) {
            layout.setMaximizedTabSet(newLayoutNode);
        }

        if (json.active && json.active === true) {
            layout.setActiveTabSet(newLayoutNode);
        }

        return newLayoutNode;
    }
    /** @internal */
    private static attributeDefinitions: Attributes = TabSetNode.createAttributeDefinitions();

    /** @internal */
    private tabStripRect: Rect = Rect.empty();
    /** @internal */
    private contentRect: Rect = Rect.empty();
    /** @internal */
    private calculatedMinHeight: number;
    /** @internal */
    private calculatedMinWidth: number;
    /** @internal */
    private calculatedMaxHeight: number;
    /** @internal */
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
        return this.model.translate(this.getAttr("name") as string | undefined);
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

    /**
     * Returns the tabs of this tabset in strip order. Tabs inside a closed (collapsed) group are
     * not included. The `selected` index is an index into this list.
     */
    getTabNodes(): TabNode[] {
        const tabs: TabNode[] = [];
        for (const child of this.children) {
            if (child instanceof TabNode) {
                tabs.push(child);
            } else if (child instanceof TabGroupNode && child.isOpened()) {
                tabs.push(...(child.getChildren() as TabNode[]));
            }
        }
        return tabs;
    }

    /** @internal number of tabs in strip order (used for single-tab stretch / overflow logic) */
    getVisibleTabCount() {
        return this.getTabNodes().length;
    }

    getSelectedNode() {
        const selected = this.getSelected();
        if (selected !== -1) {
            return this.getTabNodes()[selected];
        }
        return undefined;
    }

    /** @internal clamps the flat selected index so it always refers to a visible tab */
    repairSelected() {
        const tabs = this.getTabNodes();
        if (tabs.length === 0) {
            this.setSelected(-1);
        } else {
            const selected = this.getSelected();
            if (selected !== -1 && selected >= tabs.length) {
                this.setSelected(tabs.length - 1);
            }
        }
    }

    /** @internal */
    getPinnedRunLength() {
        // number of leading contiguous pinned tabs
        let n = 0;
        for (const child of this.children) {
            if (child instanceof TabNode && (child as TabNode).isPinned()) {
                n++;
            } else {
                break; // groups are never pinned and terminate the pinned run
            }
        }
        return n;
    }

    getWeight(): number {
        return this.getAttr("weight") as number;
    }

    /** Preferred outer width in pixels, independent of the current allocation. */
    getPreferredWidth(): number | undefined {
        return validPreferredSize(this.getAttr("preferredWidth"));
    }

    /** Preferred outer height in pixels, independent of the current allocation. */
    getPreferredHeight(): number | undefined {
        return validPreferredSize(this.getAttr("preferredHeight"));
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

    isEnableTabGroups() {
        return this.getAttr("enableTabGroups") as boolean;
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
        for (const tab of this.getTabNodes()) {
            this.calculatedMinWidth = Math.max(this.calculatedMinWidth, tab.getMinWidth());
            this.calculatedMinHeight = Math.max(this.calculatedMinHeight, tab.getMinHeight());
            this.calculatedMaxWidth = Math.min(this.calculatedMaxWidth, tab.getMaxWidth());
            this.calculatedMaxHeight = Math.min(this.calculatedMaxHeight, tab.getMaxHeight());
        }

        this.calculatedMinHeight += this.tabStripRect.height;
        this.calculatedMaxHeight += this.tabStripRect.height;

        // clamp max >= min to prevent inverted bounds from contradictory attributes
        this.calculatedMaxWidth = Math.max(this.calculatedMaxWidth, this.calculatedMinWidth);
        this.calculatedMaxHeight = Math.max(this.calculatedMaxHeight, this.calculatedMinHeight);
    }

    /** @internal */
    canMaximize() {
        if (this.isEnableMaximize()) {
            if (this.getModel().getMaximizedTabset(this.getLayoutId()) === this) {
                return true;
            }
            // single tabset: disable maximize
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
    canDrop(dragNode: Node & IDraggable, x: number, y: number, excludeCenter: boolean = false): DropInfo | undefined {
        let dropInfo;
        const layout = this.getLayout();

        if (dragNode === this) {
            const dockLocation = DockLocation.CENTER;
            const outlineRect = this.tabStripRect;
            dropInfo = new DropInfo(this, outlineRect!, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
        } else if (this.getLayoutId() !== Model.MAIN_LAYOUT_ID && !layout!.canDockTo(dragNode)) {
            return undefined;
        } else if (this.contentRect!.contains(x, y)) {
            let dockLocation = DockLocation.CENTER;
            if (this.model.getMaximizedTabset(this.getLayoutId()) === undefined) {
                // Pick valid drop type (center vs edge)
                const centerValid = !excludeCenter && this.isEnableDrop();
                const edgesValid = this.isEnableDivide();
                if (!centerValid && !edgesValid) {
                    return undefined; // neither a merge nor a split is possible
                } else if (centerValid && edgesValid) {
                    dockLocation = DockLocation.getLocation(this.contentRect!, x, y);
                } else if (centerValid) {
                    dockLocation = DockLocation.CENTER; // the whole content is a center drop
                } else {
                    dockLocation = DockLocation.getLocation(this.contentRect!, x, y, true); // the edges reach the center
                }
            }
            const outlineRect = dockLocation.getDockRect(this.rect);
            dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
        } else if (this.tabStripRect != null && this.tabStripRect.contains(x, y)) {
            dropInfo = findStripDrop(this, this.tabStripRect, this.children as (TabNode | TabGroupNode)[], dragNode, x, y, false, true);
            // a drop resolved into a group (its trailing line space) is already a complete drop; the
            // group ran its own canDockInto
            if (dropInfo !== undefined && dropInfo.node !== this) {
                return dropInfo;
            }
        }

        // clamp tabstrip drops to the pinned/unpinned boundary: a pinned tab can only drop within
        // the pinned group, anything else can only drop after it
        if (dropInfo !== undefined && dropInfo.index !== -1 && this.children.length > 0) {
            const run = this.getPinnedRunLength();
            const pinnedDrag = dragNode instanceof TabNode && dragNode.isPinned();
            const clamped = pinnedDrag ? Math.min(dropInfo.index, run) : Math.max(dropInfo.index, run);
            if (clamped !== dropInfo.index) {
                // reposition the outline to the boundary (using the boundary child's own rect keeps
                // the outline on the correct row in tab wrap mode; a group child uses its pill rect)
                let r: Rect;
                if (clamped < this.children.length) {
                    const bc = this.children[clamped];
                    const cr = bc instanceof TabGroupNode ? bc.getPillRect() : (bc as TabNode).getTabRect()!;
                    r = new Rect(cr.x - 2, cr.y, 3, cr.height);
                } else {
                    const bc = this.children[this.children.length - 1];
                    const cr = bc instanceof TabGroupNode ? bc.getPillRect() : (bc as TabNode).getTabRect()!;
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

        if (isInSubtree(this, dragNode)) {
            // tabset drop into itself or into one of its own descendants: dock back to itself / ignore
            return;
        }

        const selectedTab = this.getSelectedNode();
        const { dragParent, fromIndex } = detachDragNode(dragNode, this);

        // if dropping a tab/group back to the same tabset and moving to a forward position then reduce insertion index
        if ((dragNode instanceof TabNode || dragNode instanceof TabGroupNode) && dragParent === this && fromIndex < index && index > 0) {
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
                insertPos = Math.max(insertPos, pinnedRun); // tabset/row/group moves insert after the pinned group
            }

            if (dragNode instanceof TabNode) {
                this.addChild(dragNode, insertPos);
                restoreSelectionAfterInsert(this, selectedTab, select, dragNode);
            } else if (dragNode instanceof TabGroupNode) {
                // move the whole group (with its tabs) into this tabset as a unit
                this.addChild(dragNode, insertPos);
                restoreSelectionAfterInsert(this, selectedTab);
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
            let moveNode: TabSetNode | RowNode | TabNode | TabGroupNode;
            if (dragNode instanceof TabNode) {
                // create new tabset parent
                const callback = this.model.getOnCreateTabSet();
                moveNode = new TabSetNode(this.model, callback ? callback(dragNode as TabNode) : {});
                moveNode.addChild(dragNode);
            } else if (dragNode instanceof TabGroupNode) {
                // a group docked to an edge is wrapped in a new tabset
                moveNode = new TabSetNode(this.model, {});
                moveNode.addChild(dragNode);
            } else if (dragNode instanceof RowNode) {
                const parent = this.getParent()! as RowNode;
                // need to turn round if same orientation unless docking oposite direction
                if (dragNode.getOrientation() === parent.getOrientation() && (location.getOrientation() === parent.getOrientation() || location === DockLocation.CENTER)) {
                    const node = new RowNode(this.model, {});
                    node.addChild(dragNode);
                    moveNode = node;
                } else {
                    moveNode = dragNode;
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
                const newRow = new RowNode(this.model, parentRow.getOrientation() === Orientation.HORZ ? { preferredWidth: this.getPreferredWidth() } : { preferredHeight: this.getPreferredHeight() });
                newRow.setWeight(this.getWeight());
                newRow.addChild(this);
                this.setWeight(50);
                if (dragNode instanceof RowNode && dragNode.getChildren().length > 0 && dragNode.getOrientation() !== parentRow.getOrientation()) {
                    if (dragNode.hasPreferredSize()) {
                        const wrapper = new RowNode(this.model, {});
                        wrapper.addChild(dragNode);
                        wrapper.setWeight(50);
                        newRow.addChild(wrapper, dockLocation.indexPlus);
                    } else {
                        // the new row shares the dragged row's orientation, so flatten its children
                        // into the new row to keep the dragged layout's orientation
                        const dragChildren = dragNode.getChildren() as (RowNode | TabSetNode)[];
                        const total = dragChildren.reduce((sum, c) => sum + c.getWeight(), 0);
                        let insertIndex = dockLocation.indexPlus;
                        for (const child of dragChildren) {
                            child.setWeight(total === 0 ? 50 / dragChildren.length : (50 * child.getWeight()) / total);
                            newRow.addChild(child, insertIndex++);
                        }
                    }
                } else {
                    moveNode.setWeight(50);
                    newRow.addChild(moveNode, dockLocation.indexPlus);
                }

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
        Model.ensureAttributePairing();
        return TabSetNode.attributeDefinitions;
    }

    /** @internal */
    private static createAttributeDefinitions(): Attributes {
        const attributeDefinitions = new Attributes();
        attributeDefinitions.add("type", TabSetNode.TYPE, true).setType(Attribute.STRING).setFixed();
        attributeDefinitions.add("id", undefined).setType(Attribute.STRING).setDescription(`the unique id of the tab set, if left undefined a uuid will be assigned`);
        attributeDefinitions
            .add("weight", 100)
            .setType(Attribute.NUMBER)
            .setDescription(
                `relative weight for sizing of this tabset in parent row when no preferred size applies on the parent's split axis; retained and updated by splitters even when a preferred size takes precedence`,
            );
        attributeDefinitions
            .add("preferredWidth", undefined)
            .setType(Attribute.NUMBER)
            .setDescription(
                `preferred outer width in pixels; takes precedence over weight in a horizontal parent row without removing the weight; splitters update it, while passive resizing preserves it`,
            );
        attributeDefinitions
            .add("preferredHeight", undefined)
            .setType(Attribute.NUMBER)
            .setDescription(
                `preferred outer height in pixels; takes precedence over weight in a vertical parent row without removing the weight; splitters update it, while passive resizing preserves it`,
            );
        attributeDefinitions.add("selected", 0).setType(Attribute.NUMBER).setDescription(`index of selected/visible tab in tabset; -1 means no tab selected`);
        attributeDefinitions.add("name", undefined).setType(Attribute.STRING).setDescription(`an accessible label for the tab strip (used as the tablist's aria-label; not displayed visually)`);
        attributeDefinitions.add("config", undefined).setType("any").setDescription(`a place to hold json config used in your own code`);

        attributeDefinitions.addInherited("enableDeleteWhenEmpty", "tabSetEnableDeleteWhenEmpty").setDescription(`whether to delete this tabset when it has no tabs`);
        attributeDefinitions.addInherited("enableDrop", "tabSetEnableDrop").setDescription(`whether tabs can be dropped into this tabset`);
        attributeDefinitions.addInherited("enableDrag", "tabSetEnableDrag").setDescription(`whether the user can drag tabs out of this tabset`);
        attributeDefinitions.addInherited("enableDivide", "tabSetEnableDivide").setDescription(`whether dropping on an edge of this tabset splits it to create a new tabset`);
        attributeDefinitions.addInherited("enableMaximize", "tabSetEnableMaximize").setDescription(`whether the tabset can be maximized to fill the layout via the maximize button`);
        attributeDefinitions.addInherited("enableClose", "tabSetEnableClose").setDescription(`whether this tabset can be closed`);
        attributeDefinitions.addInherited("enableCloseButton", "tabSetEnableCloseButton").setDescription(`if the tabset can be closed then show a close button`);
        attributeDefinitions
            .addInherited("enableSingleTabStretch", "tabSetEnableSingleTabStretch")
            .setDescription(`if the tabset has only a single tab then stretch the single tab to fill area and display in a header style`);

        attributeDefinitions.addInherited("classNameTabStrip", "tabSetClassNameTabStrip").setDescription(`a class name to apply to the tab strip`);
        attributeDefinitions
            .addInherited("enableTabStrip", "tabSetEnableTabStrip")
            .setDescription(`when enabled the tabset shows a tab strip and can host multiple tabs; when disabled the strip is hidden`);
        attributeDefinitions.addInherited("minWidth", "tabSetMinWidth").setDescription(`minimum width (in px) for this tabset`);
        attributeDefinitions.addInherited("minHeight", "tabSetMinHeight").setDescription(`minimum height (in px) for this tabset`);
        attributeDefinitions.addInherited("maxWidth", "tabSetMaxWidth").setDescription(`maximum width (in px) for this tabset`);
        attributeDefinitions.addInherited("maxHeight", "tabSetMaxHeight").setDescription(`maximum height (in px) for this tabset`);

        attributeDefinitions.addInherited("enableTabWrap", "tabSetEnableTabWrap").setDescription(`wrap tabs onto multiple lines`);
        attributeDefinitions.addInherited("tabLocation", "tabSetTabLocation").setDescription(`the location of the tabs either top or bottom`);
        attributeDefinitions.addInherited("autoSelectTab", "tabSetAutoSelectTab").setDescription(`whether to select new/moved tabs in tabset`);
        attributeDefinitions.addInherited("enableActiveIcon", "tabSetEnableActiveIcon").setDescription(`whether the active icon (*) should be displayed when the tabset is active`);

        attributeDefinitions.addInherited("enableTabScrollbar", "tabSetEnableTabScrollbar").setDescription(`whether to show a mini scrollbar for the tabs`);

        attributeDefinitions.addInherited("enableTabGroups", "tabSetEnableTabGroups").setDescription(`whether the tab group options are enabled in the context menu (default menus)`);

        return attributeDefinitions;
    }
}
