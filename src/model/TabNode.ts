import { Attribute } from "../Attribute";
import { AttributeDefinitions } from "../AttributeDefinitions";
import { Rect } from "../Rect";
import { BorderNode } from "./BorderNode";
import { IDraggable } from "./IDraggable";
import { IJsonTabNode } from "./IJsonModel";
import { Model } from "./Model";
import { Node } from "./Node";
import { TabSetNode } from "./TabSetNode";

export class TabNode extends Node implements IDraggable {
    static readonly TYPE = "tab";

    /** @internal */
    static fromJson(json: any, model: Model, addToModel: boolean = true) {
        const newLayoutNode = new TabNode(model, json, addToModel);
        return newLayoutNode;
    }

    /** @internal */
    private tabRect: Rect = Rect.empty();
    /** @internal */
    private moveableElement: HTMLElement | null;
    /** @internal */
    private tabStamp: HTMLElement | null;
    /** @internal */
    private renderedName?: string;
    /** @internal */
    private extra: Record<string, any>;
    /** @internal */
    private visible: boolean;
    /** @internal */
    private rendered: boolean;
    /** @internal */
    private scrollTop?: number;
    /** @internal */
    private scrollLeft?: number;

    /** @internal */
    constructor(model: Model, json: any, addToModel: boolean = true) {
        super(model);

        this.extra = {}; // extra data added to node not saved in json
        this.moveableElement = null;
        this.tabStamp = null;
        this.rendered = false;
        this.visible = false;

        TabNode.attributeDefinitions.fromJson(json, this.attributes);
        if (addToModel === true) {
            model.addNode(this);
        }
    }

    getName() {
        return this.getAttr("name") as string;
    }

    getHelpText() {
        return this.getAttr("helpText") as string | undefined;
    }

    getComponent() {
        return this.getAttr("component") as string | undefined;
    }

    getWindowId() {
        if (this.parent instanceof TabSetNode) {
            return this.parent.getWindowId();
        }
        return Model.MAIN_WINDOW_ID;
    }

    getWindow() : Window | undefined {
        const layoutWindow = this.model.getwindowsMap().get(this.getWindowId());
        if (layoutWindow) {
            return layoutWindow.window;
        }
        return undefined;
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

    /**
     * Returns an object that can be used to store transient node specific data that will
     * NOT be saved in the json.
     */
    getExtraData() {
        return this.extra;
    }

    isPoppedOut() {
        return this.getWindowId() !== Model.MAIN_WINDOW_ID;
    }

    isSelected() {
        return (this.getParent() as TabSetNode | BorderNode).getSelectedNode() === this;
    }

    getIcon() {
        return this.getAttr("icon") as string | undefined;
    }

    isEnableClose() {
        return this.getAttr("enableClose") as boolean;
    }

    getCloseType() {
        return this.getAttr("closeType") as number;
    }

    isEnablePopout() {
        return this.getAttr("enablePopout") as boolean;
    }

    isEnablePopoutIcon() {
        return this.getAttr("enablePopoutIcon") as boolean;
    }

    isEnablePopoutOverlay() {
        return this.getAttr("enablePopoutOverlay") as boolean;
    }

    isEnableDrag() {
        return this.getAttr("enableDrag") as boolean;
    }

    isEnableRename() {
        return this.getAttr("enableRename") as boolean;
    }

    isEnableWindowReMount() {
        return this.getAttr("enableWindowReMount") as boolean;
    }

    getClassName() {
        return this.getAttr("className") as string | undefined;
    }

    getContentClassName() {
        return this.getAttr("contentClassName") as string | undefined;
    }

    getTabSetClassName() {
        return this.getAttr("tabsetClassName") as string | undefined;
    }

    isEnableRenderOnDemand() {
        return this.getAttr("enableRenderOnDemand") as boolean;
    }

    getMinWidth() {
        return this.getAttr("minWidth") as number;
    }

    getMinHeight() {
        return this.getAttr("minHeight") as number;
    }

    getMaxWidth() {
        return this.getAttr("maxWidth") as number;
    }

    getMaxHeight() {
        return this.getAttr("maxHeight") as number;
    }

    toJson(): IJsonTabNode {
        const json = {};
        TabNode.attributeDefinitions.toJson(json, this.attributes);
        return json;
    }

    /** @internal */
    saveScrollPosition() {
        if (this.moveableElement) {
            this.scrollLeft = this.moveableElement.scrollLeft;
            this.scrollTop = this.moveableElement.scrollTop;
            // console.log("save", this.getName(), this.scrollTop);
        }
    }

    /** @internal */
    restoreScrollPosition() {
        if (this.scrollTop) {
            requestAnimationFrame(() => {
                if (this.moveableElement) {
                    if (this.scrollTop) {
                        // console.log("restore", this.getName(), this.scrollTop);
                        this.moveableElement.scrollTop = this.scrollTop;
                        this.moveableElement.scrollLeft = this.scrollLeft!;
                    }
                }
            });
        }
    }

    /** @internal */
    setRect(rect: Rect) {
        if (!rect.equals(this.rect)) {
            this.fireEvent("resize", {rect});
            this.rect = rect;
        }
    }

    /** @internal */
    setVisible(visible: boolean) {
        if (visible !== this.visible) {
            this.fireEvent("visibility", { visible });
            this.visible = visible;
        }
    }

    /** @internal */
    getScrollTop() {
        return this.scrollTop;
    }

    /** @internal */
    setScrollTop(scrollTop: number | undefined) {
        this.scrollTop = scrollTop;
    }
    /** @internal */
    getScrollLeft() {
        return this.scrollLeft;
    }

    /** @internal */
    setScrollLeft(scrollLeft: number | undefined) {
        this.scrollLeft = scrollLeft;
    }
    /** @internal */
    isRendered() {
        return this.rendered;
    }

    /** @internal */
    setRendered(rendered: boolean) {
        this.rendered = rendered;
    }

    /** @internal */
    getTabRect() {
        return this.tabRect;
    }

    /** @internal */
    setTabRect(rect: Rect) {
        this.tabRect = rect;
    }

    /** @internal */
    getTabStamp() {
        return this.tabStamp;
    }

    /** @internal */
    setTabStamp(stamp: HTMLElement | null) {
        this.tabStamp = stamp;
    }

    /** @internal */
    getMoveableElement() {
        return this.moveableElement;
    }

    /** @internal */
    setMoveableElement(element: HTMLElement | null) {
        this.moveableElement = element;
    }

    /** @internal */
    setRenderedName(name: string) {
        this.renderedName = name;
    }

    /** @internal */
    getNameForOverflowMenu() {
        const altName = this.getAttr("altName") as string;
        if (altName !== undefined) {
            return altName;
        }
        return this.renderedName;
    }

    /** @internal */
    setName(name: string) {
        this.attributes.name = name;
    }

    /** @internal */
    delete() {
        (this.parent as TabSetNode | BorderNode).remove(this);
        this.fireEvent("close", {});
    }

    /** @internal */
    updateAttrs(json: any) {
        TabNode.attributeDefinitions.update(json, this.attributes);
    }

    /** @internal */
    getAttributeDefinitions() {
        return TabNode.attributeDefinitions;
    }

    /** @internal */
    setBorderWidth(width: number) {
        this.attributes.borderWidth = width;
    }

    /** @internal */
    setBorderHeight(height: number) {
        this.attributes.borderHeight = height;
    }

    /** @internal */
    static getAttributeDefinitions() {
        return TabNode.attributeDefinitions;
    }

    /** @internal */
    private static attributeDefinitions: AttributeDefinitions = TabNode.createAttributeDefinitions();

    /** @internal */
    private static createAttributeDefinitions(): AttributeDefinitions {
        const attributeDefinitions = new AttributeDefinitions();
        attributeDefinitions.add("type", TabNode.TYPE, true).setType(Attribute.STRING).setFixed();
        attributeDefinitions.add("id", undefined).setType(Attribute.STRING).setDescription(
            `the unique id of the tab, if left undefined a uuid will be assigned`
        );

        attributeDefinitions.add("name", "[Unnamed Tab]").setType(Attribute.STRING).setDescription(
            `name of tab to be displayed in the tab button`
        );
        attributeDefinitions.add("altName", undefined).setType(Attribute.STRING).setDescription(
            `if there is no name specifed then this value will be used in the overflow menu`
        );
        attributeDefinitions.add("helpText", undefined).setType(Attribute.STRING).setDescription(
            `An optional help text for the tab to be displayed upon tab hover.`
        );
        attributeDefinitions.add("component", undefined).setType(Attribute.STRING).setDescription(
            `string identifying which component to run (for factory)`
        );
        attributeDefinitions.add("config", undefined).setType("any").setDescription(
            `a place to hold json config for the hosted component`
        );
        attributeDefinitions.add("tabsetClassName", undefined).setType(Attribute.STRING).setDescription(
            `class applied to parent tabset when this is the only tab and it is stretched to fill the tabset`
        );
        attributeDefinitions.add("enableWindowReMount", false).setType(Attribute.BOOLEAN).setDescription(
            `if enabled the tab will re-mount when popped out/in`
        );

        attributeDefinitions.addInherited("enableClose", "tabEnableClose").setType(Attribute.BOOLEAN).setDescription(
            `allow user to close tab via close button`
        );
        attributeDefinitions.addInherited("closeType", "tabCloseType").setType("ICloseType").setDescription(
            `see values in ICloseType`
        );
        attributeDefinitions.addInherited("enableDrag", "tabEnableDrag").setType(Attribute.BOOLEAN).setDescription(
            `allow user to drag tab to new location`
        );
        attributeDefinitions.addInherited("enableRename", "tabEnableRename").setType(Attribute.BOOLEAN).setDescription(
            `allow user to rename tabs by double clicking`
        );
        attributeDefinitions.addInherited("className", "tabClassName").setType(Attribute.STRING).setDescription(
            `class applied to tab button`
        );
        attributeDefinitions.addInherited("contentClassName", "tabContentClassName").setType(Attribute.STRING).setDescription(
            `class applied to tab content`
        );
        attributeDefinitions.addInherited("icon", "tabIcon").setType(Attribute.STRING).setDescription(
            `the tab icon`
        );
        attributeDefinitions.addInherited("enableRenderOnDemand", "tabEnableRenderOnDemand").setType(Attribute.BOOLEAN).setDescription(
            `whether to avoid rendering component until tab is visible`
        );
        attributeDefinitions.addInherited("enablePopout", "tabEnablePopout").setType(Attribute.BOOLEAN).setAlias("enableFloat").setDescription(
            `enable popout (in popout capable browser)`
        );
        attributeDefinitions.addInherited("enablePopoutIcon", "tabEnablePopoutIcon").setType(Attribute.BOOLEAN).setDescription(
            `whether to show the popout icon in the tabset header if this tab enables popouts`
        );
        attributeDefinitions.addInherited("enablePopoutOverlay", "tabEnablePopoutOverlay").setType(Attribute.BOOLEAN).setDescription(
            `if this tab will not work correctly in a popout window when the main window is backgrounded (inactive)
            then enabling this option will gray out this tab`
        );

        attributeDefinitions.addInherited("borderWidth", "tabBorderWidth").setType(Attribute.NUMBER).setDescription(
            `width when added to border, -1 will use border size`
        );
        attributeDefinitions.addInherited("borderHeight", "tabBorderHeight").setType(Attribute.NUMBER).setDescription(
            `height when added to border, -1 will use border size`
        );
        attributeDefinitions.addInherited("minWidth", "tabMinWidth").setType(Attribute.NUMBER).setDescription(
            `the min width of this tab`
        );
        attributeDefinitions.addInherited("minHeight", "tabMinHeight").setType(Attribute.NUMBER).setDescription(
            `the min height of this tab`
        );
        attributeDefinitions.addInherited("maxWidth", "tabMaxWidth").setType(Attribute.NUMBER).setDescription(
            `the max width of this tab`
        );
        attributeDefinitions.addInherited("maxHeight", "tabMaxHeight").setType(Attribute.NUMBER).setDescription(
            `the max height of this tab`
        );

        return attributeDefinitions;
    }
}
