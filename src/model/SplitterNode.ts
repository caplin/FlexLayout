import AttributeDefinitions from "../AttributeDefinitions";
import Orientation from "../Orientation";
import Model from "./Model";
import Node from "./Node";

class SplitterNode extends Node {

  public static readonly TYPE: string = "splitter";

  /** @hidden @internal */
  constructor(model: Model) {
    super(model);
    this._fixed = true;
    this._attributes.type = SplitterNode.TYPE;
    model._addNode(this);
  }

  /** @hidden @internal */
  public getWidth() {
    return this._model.getSplitterSize();
  }

  /** @hidden @internal */
  public getHeight() {
    return this._model.getSplitterSize();
  }

  /** @hidden @internal */
  public getWeight(): number {
    return 0;
  }

  /** @hidden @internal */
  public _setWeight(value: number): void {
  }

  /** @hidden @internal */
  public _getPrefSize(orientation: Orientation): number {
    return this._model.getSplitterSize();
  }

  /** @hidden @internal */
  public _updateAttrs(json: any): void {
  }

  /** @hidden @internal */
  public _getAttributeDefinitions(): AttributeDefinitions {
    return new AttributeDefinitions();
  }

  /** @hidden @internal */
  public _toJson(): any {
    return undefined;
  }
}

export default SplitterNode;
