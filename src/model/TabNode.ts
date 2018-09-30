import Node from "./Node";
import TabSetNode from "./TabSetNode";
import BorderNode from "./BorderNode";
import AttributeDefinitions from "../AttributeDefinitions";
import Attribute from "../Attribute";
import Rect from "../Rect";
import Model from "./Model";
import IDraggable from "./IDraggable";
import { JSMap } from "../Types";

class TabNode extends Node implements IDraggable{

    public static readonly TYPE = "tab";
    /** @hidden @internal */
    private static _attributeDefinitions: AttributeDefinitions = TabNode._createAttributeDefinitions();

    /** @hidden @internal */
    private _tabRect?: Rect;
    /** @hidden @internal */
    private _extra: JSMap<any>;

    /** @hidden @internal */
    constructor(model: Model, json: any) {
        super(model);

        this._extra = {};  // extra data added to node not saved in json

        TabNode._attributeDefinitions.fromJson(json, this._attributes);
        model._addNode(this);
    }

    getTabRect() {
        return this._tabRect;
    }

    /** @hidden @internal */
    _setTabRect(rect: Rect) {
        this._tabRect = rect;
    }

    getName() {
        return this._getAttr("name") as string;
    }

    getComponent() {
        return this._getAttributeAsStringOrUndefined("component");
    }

    /**
     * Returns the config attribute that can be used to store node specific data that
     * WILL be saved to the json. The config attribute should be changed via the action Actions.updateNodeAttributes rather
     * than directly, for example:
     * this.state.model.doAction(
     *   FlexLayout.Actions.updateNodeAttributes(node.getId(), {config:myConfigObject}));
     */
    getConfig() {
        return this._attributes["config"];
    }

    /**
     * Returns an object that can be used to store transient node specific data that will
     * NOT be saved in the json.
     */
    getExtraData() {
        return this._extra;
    }

    getIcon() {
        return this._getAttributeAsStringOrUndefined("icon");
    }

    isEnableClose() {
        return this._getAttr("enableClose") as boolean;
    }

    isEnableDrag() {
        return this._getAttr("enableDrag") as boolean;
    }

    isEnableRename() {
        return this._getAttr("enableRename") as boolean;
    }

    getClassName() {
        return this._getAttributeAsStringOrUndefined("className");
    }

    isEnableRenderOnDemand(){
        return this._getAttr("enableRenderOnDemand") as boolean;
    }

    /** @hidden @internal */
    _setName(name: string) {
        this._attributes["name"] = name;
    }

    /** @hidden @internal */
    _layout(rect: Rect) {
        if (!rect.equals(this._rect)) {
            this._fireEvent("resize", { rect: rect });
        }
        this._rect = rect;
    }

    /** @hidden @internal */
    _delete() {
        (this._parent as TabSetNode | BorderNode)._remove(this);
        this._fireEvent("close", {});
    }

    /** @hidden @internal */
    static _fromJson(json: any, model: Model) {
        const newLayoutNode = new TabNode(model, json);
        return newLayoutNode;
    }

    /** @hidden @internal */
    _toJson() {
        const json = {};
        TabNode._attributeDefinitions.toJson(json, this._attributes);
        return json;
    }

    /** @hidden @internal */
    _updateAttrs(json: any) {
        TabNode._attributeDefinitions.update(json, this._attributes);
    }

    /** @hidden @internal */
    _getAttributeDefinitions() {
        return TabNode._attributeDefinitions;
    }

    /** @hidden @internal */
    private static _createAttributeDefinitions(): AttributeDefinitions {

        let attributeDefinitions = new AttributeDefinitions();
        attributeDefinitions.add("type", TabNode.TYPE, true);
        attributeDefinitions.add("id", undefined).setType(Attribute.ID);

        attributeDefinitions.add("name", "[Unnamed Tab]").setType(Attribute.STRING);
        attributeDefinitions.add("component", undefined).setType(Attribute.STRING);
        attributeDefinitions.add("config", undefined).setType(Attribute.JSON);

        attributeDefinitions.addInherited("enableClose", "tabEnableClose").setType(Attribute.BOOLEAN);
        attributeDefinitions.addInherited("enableDrag", "tabEnableDrag").setType(Attribute.BOOLEAN);
        attributeDefinitions.addInherited("enableRename", "tabEnableRename").setType(Attribute.BOOLEAN);
        attributeDefinitions.addInherited("className", "tabClassName").setType(Attribute.STRING);
        attributeDefinitions.addInherited("icon", "tabIcon").setType(Attribute.STRING);
        attributeDefinitions.addInherited("enableRenderOnDemand", "tabEnableRenderOnDemand").setType(Attribute.BOOLEAN);
        return attributeDefinitions;
    }
}

export default TabNode;
