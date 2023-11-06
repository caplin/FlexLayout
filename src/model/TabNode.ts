import { Attribute } from "../Attribute";
import { AttributeDefinitions } from "../AttributeDefinitions";
import { Rect } from "../Rect";
import { BorderNode } from "./BorderNode";
import { IDraggable } from "./IDraggable";
import { IJsonTabNode } from "./IJsonModel";
import { Model, ILayoutMetrics } from "./Model";
import { Node } from "./Node";
import { TabSetNode } from "./TabSetNode";

export class TabNode extends Node implements IDraggable {
    static readonly TYPE = "tab";

    /** @internal */
    static _fromJson(json: any, model: Model, addToModel: boolean = true) {
        const newLayoutNode = new TabNode(model, json, addToModel);
        return newLayoutNode;
    }
    /** @internal */
    private static _attributeDefinitions: AttributeDefinitions = TabNode._createAttributeDefinitions();

    /** @internal */
    private static _createAttributeDefinitions(): AttributeDefinitions {
        const attributeDefinitions = new AttributeDefinitions();
        attributeDefinitions.add("type", TabNode.TYPE, true).setType(Attribute.STRING);
        attributeDefinitions.add("id", undefined).setType(Attribute.STRING);

        attributeDefinitions.add("name", "[Unnamed Tab]").setType(Attribute.STRING);
        attributeDefinitions.add("altName", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("helpText", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("component", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("config", undefined).setType("any");
        attributeDefinitions.add("floating", false).setType(Attribute.BOOLEAN);
        attributeDefinitions.add("tabsetClassName", undefined).setType(Attribute.STRING);

        attributeDefinitions.addInherited("enableClose", "tabEnableClose").setType(Attribute.BOOLEAN);
        attributeDefinitions.addInherited("closeType", "tabCloseType").setType("ICloseType");
        attributeDefinitions.addInherited("enableDrag", "tabEnableDrag").setType(Attribute.BOOLEAN);
        attributeDefinitions.addInherited("enableRename", "tabEnableRename").setType(Attribute.BOOLEAN);
        attributeDefinitions.addInherited("className", "tabClassName").setType(Attribute.STRING);
        attributeDefinitions.addInherited("contentClassName", "tabContentClassName").setType(Attribute.STRING);
        attributeDefinitions.addInherited("icon", "tabIcon").setType(Attribute.STRING);
        attributeDefinitions.addInherited("enableRenderOnDemand", "tabEnableRenderOnDemand").setType(Attribute.BOOLEAN);
        attributeDefinitions.addInherited("enableFloat", "tabEnableFloat").setType(Attribute.BOOLEAN);
        attributeDefinitions.addInherited("borderWidth", "tabBorderWidth").setType(Attribute.NUMBER);
        attributeDefinitions.addInherited("borderHeight", "tabBorderHeight").setType(Attribute.NUMBER);
        return attributeDefinitions;
    }

    /** @internal */
    private _tabRect?: Rect;
    /** @internal */
    private _renderedName?: string;
    /** @internal */
    private _extra: Record<string, any>;
    /** @internal */
    private _window?: Window;

    /** @internal */
    constructor(model: Model, json: any, addToModel: boolean = true) {
        super(model);

        this._extra = {}; // extra data added to node not saved in json

        TabNode._attributeDefinitions.fromJson(json, this._attributes);
        if (addToModel === true) {
            model._addNode(this);
        }
    }

    getWindow() {
        return this._window;
    }

    getTabRect() {
        return this._tabRect;
    }

    /** @internal */
    _setTabRect(rect: Rect) {
        this._tabRect = rect;
    }

    /** @internal */
    _setRenderedName(name: string) {
        this._renderedName = name;
    }

    /** @internal */
    _getNameForOverflowMenu() {
        const altName = this._getAttr("altName") as string;
        if (altName !== undefined) {
            return altName;
        }
        return this._renderedName;
    }

    getName() {
        return this._getAttr("name") as string;
    }

    getHelpText() {
        return this._getAttr("helpText") as string | undefined;
    }

    getComponent() {
        return this._getAttr("component") as string | undefined;
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

    /**
     * Returns an object that can be used to store transient node specific data that will
     * NOT be saved in the json.
     */
    getExtraData() {
        return this._extra;
    }

    isFloating() {
        return this._getAttr("floating") as boolean;
    }

    getIcon() {
        return this._getAttr("icon") as string | undefined;
    }

    isEnableClose() {
        return this._getAttr("enableClose") as boolean;
    }

    getCloseType() {
        return this._getAttr("closeType") as number;
    }

    isEnableFloat() {
        return this._getAttr("enableFloat") as boolean;
    }

    isEnableDrag() {
        return this._getAttr("enableDrag") as boolean;
    }

    isEnableRename() {
        return this._getAttr("enableRename") as boolean;
    }

    getClassName() {
        return this._getAttr("className") as string | undefined;
    }
    
    getContentClassName() {
        return this._getAttr("contentClassName") as string | undefined;
    }

    getTabSetClassName() {
        return this._getAttr("tabsetClassName") as string | undefined;
    }

    isEnableRenderOnDemand() {
        return this._getAttr("enableRenderOnDemand") as boolean;
    }

    /** @internal */
    _setName(name: string) {
        this._attributes.name = name;
        if (this._window && this._window.document) {
            this._window.document.title = name;
        }
    }

    /** @internal */
    _setFloating(float: boolean) {
        this._attributes.floating = float;
    }

    /** @internal */
    _layout(rect: Rect, metrics: ILayoutMetrics) {
        if (!rect.equals(this._rect)) {
            this._fireEvent("resize", { rect });
        }
        this._rect = rect;
    }

    /** @internal */
    _delete() {
        (this._parent as TabSetNode | BorderNode)._remove(this);
        this._fireEvent("close", {});
    }

    toJson(): IJsonTabNode {
        const json = {};
        TabNode._attributeDefinitions.toJson(json, this._attributes);
        return json;
    }

    /** @internal */
    _updateAttrs(json: any) {
        TabNode._attributeDefinitions.update(json, this._attributes);
    }

    /** @internal */
    _getAttributeDefinitions() {
        return TabNode._attributeDefinitions;
    }

    /** @internal */
    _setWindow(window: Window | undefined) {
        this._window = window;
    }

    /** @internal */
    _setBorderWidth(width: number) {
        this._attributes.borderWidth = width;
    }

    /** @internal */
    _setBorderHeight(height: number) {
        this._attributes.borderHeight = height;
    }

    /** @internal */
    static getAttributeDefinitions() {
        return TabNode._attributeDefinitions;
    }

}
