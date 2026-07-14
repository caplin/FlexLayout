import { Attribute } from "./Attributes";
import { Attributes } from "./Attributes";
import { DockLocation } from "./DockLocation";
import { DropInfo } from "./DropInfo";
import { Orientation } from "./Orientation";
import { Rect } from "./Rect";
import { CLASSES } from "../view/CSSClassNames";
import { IDraggable } from "./IDraggable";
import { IDropTarget } from "./IDropTarget";
import { IBorderAttributes, IBorderLocation, IJsonBorderNode } from "./IJsonModel";
import { Model } from "./Model";
import { Node } from "./Node";
import { TabNode } from "./TabNode";
import { TabSetNode } from "./TabSetNode";
import { adjustSelectedIndex, adjustSelectedIndexAfterInsert } from "./Utils";

export class BorderNode extends Node implements IDropTarget {
    static readonly TYPE = "border";

    /** @internal */
    static fromJson(json: IJsonBorderNode, model: Model) {
        const location = DockLocation.getByName(json.location);
        const border = new BorderNode(location, json, model);
        if (json.children) {
            border.children = json.children.map((jsonChild: any) => {
                const child = TabNode.fromJson(jsonChild, model);
                child.setParent(border);
                return child;
            });
        }

        if (border.getSelected() >= border.children.length) {
            // clamp an out of range selected index from the json (empty border -> -1); an out of
            // range index would otherwise crash getSize/setSize dereferencing children[selected]
            border.setSelected(border.children.length - 1);
        }

        return border;
    }
    /** @internal */
    private static attributeDefinitions: Attributes = BorderNode.createAttributeDefinitions();

    /** @internal */
    private contentRect: Rect = Rect.empty();
    /** @internal */
    private tabHeaderRect: Rect = Rect.empty();
    /** @internal */
    private location: DockLocation;

    /** @internal */
    constructor(location: DockLocation, json: IJsonBorderNode, model: Model) {
        super(model);

        this.location = location;
        this.attributes.id = `border_${location.getName()}`;
        BorderNode.attributeDefinitions.fromJson(json, this.attributes);
        model.addNode(this);
    }

    getLocation() {
        return this.location;
    }

    getClassName() {
        return this.getAttr("className") as string | undefined;
    }

    isHorizontal() {
        return this.location.orientation === Orientation.HORZ;
    }

    getSize() {
        const defaultSize = this.getAttr("size") as number;
        const selected = this.getSelected();
        if (selected === -1) {
            return defaultSize;
        } else {
            const tabNode = this.children[selected] as TabNode;
            const tabBorderSize = this.isHorizontal() ? tabNode.getAttr("borderWidth") : tabNode.getAttr("borderHeight");
            if (tabBorderSize === -1) {
                return defaultSize;
            } else {
                return tabBorderSize;
            }
        }
    }

    getMinSize() {
        const selectedNode = this.getSelectedNode();
        let min = this.getAttr("minSize") as number;
        if (selectedNode) {
            const nodeMin = this.isHorizontal() ? selectedNode.getMinWidth() : selectedNode.getMinHeight();
            min = Math.max(min, nodeMin);
        }
        return min;
    }

    getMaxSize() {
        const selectedNode = this.getSelectedNode();
        let max = this.getAttr("maxSize") as number;
        if (selectedNode) {
            const nodeMax = this.isHorizontal() ? selectedNode.getMaxWidth() : selectedNode.getMaxHeight();
            max = Math.min(max, nodeMax);
        }
        return max;
    }

    getSelected(): number {
        return this.attributes.selected as number;
    }

    isAutoHide() {
        return this.getAttr("enableAutoHide") as boolean;
    }

    getBorderType() {
        return this.getAttr("borderType") as "split" | "overlay";
    }

    isOverlay() {
        return this.getAttr("borderType") === "overlay";
    }

    /** @internal */
    setBorderType(borderType: "split" | "overlay") {
        this.attributes.borderType = borderType;
    }

    getSelectedNode(): TabNode | undefined {
        if (this.getSelected() !== -1) {
            return this.children[this.getSelected()] as TabNode;
        }
        return undefined;
    }

    getOrientation() {
        return this.location.getOrientation();
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
        return false;
    }

    isShowing() {
        return this.attributes.show as boolean;
    }

    toJson(): IJsonBorderNode {
        const json: IJsonBorderNode = { location: "bottom" };
        BorderNode.attributeDefinitions.toJson(json, this.attributes);
        json.location = this.location.getName() as IBorderLocation;
        json.children = this.children.map((child) => (child as TabNode).toJson());
        return json;
    }

    /** @internal */
    isAutoSelectTab(whenOpen?: boolean) {
        if (whenOpen == null) {
            whenOpen = this.getSelected() !== -1;
        }
        if (whenOpen) {
            return this.getAttr("autoSelectTabWhenOpen") as boolean;
        } else {
            return this.getAttr("autoSelectTabWhenClosed") as boolean;
        }
    }

    isEnableTabScrollbar() {
        return this.getAttr("enableTabScrollbar") as boolean;
    }

    /** @internal */
    setSelected(index: number) {
        this.attributes.selected = index;
    }

    /** @internal */
    setTabHeaderRect(r: Rect) {
        this.tabHeaderRect = r;
    }

    /** @internal */
    getRect() {
        return this.tabHeaderRect!;
    }

    /** @internal */
    getContentRect() {
        return this.contentRect;
    }

    /** @internal */
    setContentRect(r: Rect) {
        this.contentRect = r;
    }

    /** @internal */
    isEnableDrop() {
        return this.getAttr("enableDrop") as boolean;
    }

    /** @internal */
    setSize(pos: number) {
        const selected = this.getSelected();
        if (selected === -1) {
            this.attributes.size = pos;
        } else {
            const tabNode = this.children[selected] as TabNode;
            const tabBorderSize = this.isHorizontal() ? tabNode.getAttr("borderWidth") : tabNode.getAttr("borderHeight");
            if (tabBorderSize === -1) {
                this.attributes.size = pos;
            } else {
                if (this.isHorizontal()) {
                    tabNode.setBorderWidth(pos);
                } else {
                    tabNode.setBorderHeight(pos);
                }
            }
        }
    }

    /** @internal */
    updateAttrs(json: IBorderAttributes) {
        BorderNode.attributeDefinitions.update(json, this.attributes);
    }

    /** @internal */
    remove(node: TabNode) {
        const removedIndex = this.removeChild(node);
        if (this.getSelected() !== -1) {
            adjustSelectedIndex(this, removedIndex);
        }
    }

    /** @internal */
    canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
        if (!(dragNode instanceof TabNode)) {
            return undefined;
        }

        let dropInfo;
        const dockLocation = DockLocation.CENTER;

        if (this.tabHeaderRect!.contains(x, y)) {
            if (this.location.orientation === Orientation.VERT) {
                if (this.children.length > 0) {
                    let child = this.children[0];
                    let childRect = (child as TabNode).getTabRect()!;
                    const childY = childRect.y;

                    const childHeight = childRect.height;

                    let pos = this.tabHeaderRect!.x;
                    for (let i = 0; i < this.children.length; i++) {
                        child = this.children[i];
                        childRect = (child as TabNode).getTabRect()!;
                        const childCenter = childRect.x + childRect.width / 2;
                        if (x >= pos && x < childCenter) {
                            const outlineRect = new Rect(childRect.x - 2, childY, 3, childHeight);
                            dropInfo = new DropInfo(this, outlineRect, dockLocation, i, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
                            break;
                        }
                        pos = childCenter;
                    }
                    if (dropInfo == null) {
                        const outlineRect = new Rect(childRect.getRight() - 2, childY, 3, childHeight);
                        dropInfo = new DropInfo(this, outlineRect, dockLocation, this.children.length, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
                    }
                } else {
                    const outlineRect = new Rect(this.tabHeaderRect!.x + 1, this.tabHeaderRect!.y + 2, 3, 18);
                    dropInfo = new DropInfo(this, outlineRect, dockLocation, 0, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
                }
            } else {
                if (this.children.length > 0) {
                    let child = this.children[0];
                    let childRect = (child as TabNode).getTabRect()!;
                    const childX = childRect.x;
                    const childWidth = childRect.width;

                    let pos = this.tabHeaderRect!.y;
                    for (let i = 0; i < this.children.length; i++) {
                        child = this.children[i];
                        childRect = (child as TabNode).getTabRect()!;
                        const childCenter = childRect.y + childRect.height / 2;
                        if (y >= pos && y < childCenter) {
                            const outlineRect = new Rect(childX, childRect.y - 2, childWidth, 3);
                            dropInfo = new DropInfo(this, outlineRect, dockLocation, i, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
                            break;
                        }
                        pos = childCenter;
                    }
                    if (dropInfo == null) {
                        const outlineRect = new Rect(childX, childRect.getBottom() - 2, childWidth, 3);
                        dropInfo = new DropInfo(this, outlineRect, dockLocation, this.children.length, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
                    }
                } else {
                    const outlineRect = new Rect(this.tabHeaderRect!.x + 2, this.tabHeaderRect!.y + 1, 18, 3);
                    dropInfo = new DropInfo(this, outlineRect, dockLocation, 0, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
                }
            }
            if (!this.canDockInto(dragNode, dropInfo)) {
                return undefined;
            }
        } else if (this.getSelected() !== -1 && this.contentRect!.contains(x, y)) {
            const outlineRect = this.contentRect;
            dropInfo = new DropInfo(this, outlineRect!, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT);
            if (!this.canDockInto(dragNode, dropInfo)) {
                return undefined;
            }
        }

        return dropInfo;
    }

    /** @internal */
    drop(dragNode: Node & IDraggable, location: DockLocation, index: number, select?: boolean): void {
        if (!(dragNode instanceof TabNode)) {
            return; // borders can only contain tabs (as in canDrop)
        }

        let fromIndex = 0;
        const dragParent = dragNode.getParent() as BorderNode | TabSetNode;
        if (dragParent !== undefined) {
            fromIndex = dragParent.removeChild(dragNode);
            // if selected node in border is being docked into a different border then deselect border tabs
            if (dragParent !== this && dragParent instanceof BorderNode && dragParent.getSelected() === fromIndex) {
                dragParent.setSelected(-1);
            } else {
                adjustSelectedIndex(dragParent, fromIndex);
            }
        }

        // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
        if (dragParent === this && fromIndex < index && index > 0) {
            index--;
        }

        // simple_bundled dock to existing tabset
        let insertPos = index;
        if (insertPos === -1) {
            insertPos = this.children.length;
        }

        this.addChild(dragNode, insertPos);

        if (select || (select !== false && this.isAutoSelectTab())) {
            this.setSelected(insertPos);
        } else {
            adjustSelectedIndexAfterInsert(this, insertPos);
        }

        this.model.tidy();
    }

    /** @internal */
    getSplitterBounds(index: number, useMinSize: boolean = false) {
        const pBounds = [0, 0];
        const minSize = useMinSize ? this.getMinSize() : 0;
        const maxSize = useMinSize ? this.getMaxSize() : 99999;
        const rootRow = this.model.getRootRow(Model.MAIN_LAYOUT_ID)!;
        const innerRect = rootRow.getRect();
        const splitterSize = this.model.getSplitterSize()!;
        if (this.location === DockLocation.TOP) {
            pBounds[0] = this.tabHeaderRect!.getBottom() + minSize;
            const maxPos = this.tabHeaderRect!.getBottom() + maxSize;
            pBounds[1] = Math.max(pBounds[0], innerRect.getBottom() - rootRow.getMinHeight() - splitterSize);
            pBounds[1] = Math.min(pBounds[1], maxPos);
        } else if (this.location === DockLocation.LEFT) {
            pBounds[0] = this.tabHeaderRect!.getRight() + minSize;
            const maxPos = this.tabHeaderRect!.getRight() + maxSize;
            pBounds[1] = Math.max(pBounds[0], innerRect.getRight() - rootRow.getMinWidth() - splitterSize);
            pBounds[1] = Math.min(pBounds[1], maxPos);
        } else if (this.location === DockLocation.BOTTOM) {
            pBounds[1] = this.tabHeaderRect!.y - minSize - splitterSize;
            const maxPos = this.tabHeaderRect!.y - maxSize - splitterSize;
            pBounds[0] = Math.min(pBounds[1], innerRect.y + rootRow.getMinHeight());
            pBounds[0] = Math.max(pBounds[0], maxPos);
        } else if (this.location === DockLocation.RIGHT) {
            pBounds[1] = this.tabHeaderRect!.x - minSize - splitterSize;
            const maxPos = this.tabHeaderRect!.x - maxSize - splitterSize;
            pBounds[0] = Math.min(pBounds[1], innerRect.x + rootRow.getMinWidth());
            pBounds[0] = Math.max(pBounds[0], maxPos);
        }
        return pBounds;
    }

    /** @internal */
    calculateSplit(splitter: BorderNode, splitterPos: number) {
        const pBounds = this.getSplitterBounds(splitterPos);
        if (this.location === DockLocation.BOTTOM || this.location === DockLocation.RIGHT) {
            return Math.max(0, pBounds[1] - splitterPos);
        } else {
            return Math.max(0, splitterPos - pBounds[0]);
        }
    }

    /** @internal */
    getAttributeDefinitions() {
        return BorderNode.attributeDefinitions;
    }

    /** @internal */
    static getAttributeDefinitions() {
        return BorderNode.attributeDefinitions;
    }

    /** @internal */
    private static createAttributeDefinitions(): Attributes {
        const attributeDefinitions = new Attributes();
        attributeDefinitions.add("type", BorderNode.TYPE, true).setType(Attribute.STRING).setFixed();

        attributeDefinitions.add("selected", -1).setType(Attribute.NUMBER).setDescription(`index of selected/visible tab in border; -1 means no tab selected`);
        attributeDefinitions
            .add("borderType", "split")
            .setType(Attribute.STRING)
            .setDescription(
                `the border display type: 'split' splits the main layout to make room when a tab is selected; 'overlay' shows
            the selected tab's panel as an overlay on top of the main layout area, and the tab is deselected
            by a pointer-down in the main layout area (Visual Studio style auto hide). Set via
            Actions.setBorderType. Not related to enableAutoHide (which hides the border strip when it has
            zero tabs)`,
            );
        attributeDefinitions.add("show", true).setType(Attribute.BOOLEAN).setDescription(`show/hide this border`);
        attributeDefinitions.add("config", undefined).setType("any").setDescription(`a place to hold json config used in your own code`);

        attributeDefinitions.addInherited("enableDrop", "borderEnableDrop").setType(Attribute.BOOLEAN).setDescription(`whether tabs can be dropped into this border`);
        attributeDefinitions.addInherited("className", "borderClassName").setType(Attribute.STRING).setDescription(`class applied to tab button`);
        attributeDefinitions
            .addInherited("autoSelectTabWhenOpen", "borderAutoSelectTabWhenOpen")
            .setType(Attribute.BOOLEAN)
            .setDescription(`whether to select new/moved tabs in border when the border is already open`);
        attributeDefinitions
            .addInherited("autoSelectTabWhenClosed", "borderAutoSelectTabWhenClosed")
            .setType(Attribute.BOOLEAN)
            .setDescription(`whether to select new/moved tabs in border when the border is currently closed`);
        attributeDefinitions.addInherited("size", "borderSize").setType(Attribute.NUMBER).setDescription(`size of the tab area when selected`);
        attributeDefinitions.addInherited("minSize", "borderMinSize").setType(Attribute.NUMBER).setDescription(`the minimum size of the tab area`);
        attributeDefinitions.addInherited("maxSize", "borderMaxSize").setType(Attribute.NUMBER).setDescription(`the maximum size of the tab area`);
        attributeDefinitions
            .addInherited("enableAutoHide", "borderEnableAutoHide")
            .setType(Attribute.BOOLEAN)
            .setDescription(
                `hide border if it has zero tabs; not related to the borderType 'overlay' mode (Visual Studio
            style auto hide), see the borderType attribute`,
            );
        attributeDefinitions.addInherited("enableTabScrollbar", "borderEnableTabScrollbar").setType(Attribute.BOOLEAN).setDescription(`whether to show a mini scrollbar for the tabs`);
        return attributeDefinitions;
    }
}
