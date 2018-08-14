import Node from "./Node";
import Model from "./Model";
import AttributeDefinitions from "../AttributeDefinitions";
import Orientation from "../Orientation";

class SplitterNode extends Node {

    public static readonly TYPE: string = "splitter";

    /** @hidden @internal */
    constructor(model: Model) {
        super(model);
        this._fixed = true;
        this._attributes["type"] = SplitterNode.TYPE;
        model._addNode(this);
    }

    /** @hidden @internal */
    getWidth() {
        return this._model.getSplitterSize();
    }

    /** @hidden @internal */
    getHeight() {
        return this._model.getSplitterSize();
    }

    /** @hidden @internal */
    getWeight(): number {
        return 0;
    }

    /** @hidden @internal */
    _setWeight(value: number): void {
    }

    /** @hidden @internal */
    _getPrefSize(orientation: Orientation): number {
        return this._model.getSplitterSize();
    }

    /** @hidden @internal */
    _updateAttrs(json: any): void {
    }

    /** @hidden @internal */
    _getAttributeDefinitions(): AttributeDefinitions {
        return new AttributeDefinitions();
    }

    /** @hidden @internal */
    _toJson(): any {
        return undefined;
    }
}

export default SplitterNode;
