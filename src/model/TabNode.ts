import Attribute from "../Attribute";
import AttributeDefinitions from "../AttributeDefinitions";
import Rect from "../Rect";
import { JSMap } from "../Types";
import BorderNode from "./BorderNode";
import IDraggable from "./IDraggable";
import Model from "./Model";
import Node from "./Node";
import TabSetNode from "./TabSetNode";

class TabNode extends Node implements IDraggable {

  public static readonly TYPE = "tab";

  /** @hidden @internal */
  public static _fromJson(json: any, model: Model) {
    const newLayoutNode = new TabNode(model, json);
    return newLayoutNode;
  }
  /** @hidden @internal */
  private static _attributeDefinitions: AttributeDefinitions = TabNode._createAttributeDefinitions();

  /** @hidden @internal */
  private static _createAttributeDefinitions(): AttributeDefinitions {

    const attributeDefinitions = new AttributeDefinitions();
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

  public getTabRect() {
    return this._tabRect;
  }

  /** @hidden @internal */
  public _setTabRect(rect: Rect) {
    this._tabRect = rect;
  }

  public getName() {
    return this._getAttr("name") as string;
  }

  public getComponent() {
    return this._getAttributeAsStringOrUndefined("component");
  }

  /**
   * Returns the config attribute that can be used to store node specific data that
   * WILL be saved to the json. The config attribute should be changed via the action Actions.updateNodeAttributes rather
   * than directly, for example:
   * this.state.model.doAction(
   *   FlexLayout.Actions.updateNodeAttributes(node.getId(), {config:myConfigObject}));
   */
  public getConfig() {
    return this._attributes.config;
  }

  /**
   * Returns an object that can be used to store transient node specific data that will
   * NOT be saved in the json.
   */
  public getExtraData() {
    return this._extra;
  }

  public getIcon() {
    return this._getAttributeAsStringOrUndefined("icon");
  }

  public isEnableClose() {
    return this._getAttr("enableClose") as boolean;
  }

  public isEnableDrag() {
    return this._getAttr("enableDrag") as boolean;
  }

  public isEnableRename() {
    return this._getAttr("enableRename") as boolean;
  }

  public getClassName() {
    return this._getAttributeAsStringOrUndefined("className");
  }

  public isEnableRenderOnDemand() {
    return this._getAttr("enableRenderOnDemand") as boolean;
  }

  /** @hidden @internal */
  public _setName(name: string) {
    this._attributes.name = name;
  }

  /** @hidden @internal */
  public _layout(rect: Rect) {
    if (!rect.equals(this._rect)) {
      this._fireEvent("resize", { rect });
    }
    this._rect = rect;
  }

  /** @hidden @internal */
  public _delete() {
    (this._parent as TabSetNode | BorderNode)._remove(this);
    this._fireEvent("close", {});
  }

  /** @hidden @internal */
  public _toJson() {
    const json = {};
    TabNode._attributeDefinitions.toJson(json, this._attributes);
    return json;
  }

  /** @hidden @internal */
  public _updateAttrs(json: any) {
    TabNode._attributeDefinitions.update(json, this._attributes);
  }

  /** @hidden @internal */
  public _getAttributeDefinitions() {
    return TabNode._attributeDefinitions;
  }
}

export default TabNode;
