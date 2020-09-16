import AttributeDefinitions from "../AttributeDefinitions";
import Orientation from "../Orientation";
import Model from "./Model";
import Node from "./Node";

class SplitterNode extends Node {
    static readonly TYPE: string = "splitter";

    /** @hidden @internal */
    constructor(model: Model) {
        super(model);
        this._fixed = true;
        this._attributes.type = SplitterNode.TYPE;
        model._addNode(this);
    }

    /** @hidden @internal */
    getWidth() {
        return this._model.getSplitterSize();
    }

    /** @hidden @internal */
    getMinWidth() {
        if (this.getOrientation() === Orientation.VERT) {
            return this._model.getSplitterSize();
        } else {
            return 0;
        }
    }

    /** @hidden @internal */
    getHeight() {
        return this._model.getSplitterSize();
    }

    /** @hidden @internal */
    getMinHeight() {
        if (this.getOrientation() === Orientation.HORZ) {
            return this._model.getSplitterSize();
        } else {
            return 0;
        }
    }

    /** @hidden @internal */
    getMinSize(orientation: Orientation) {
        if (orientation === Orientation.HORZ) {
            return this.getMinWidth();
        } else {
            return this.getMinHeight();
        }
    }

    /** @hidden @internal */
    getWeight(): number {
        return 0;
    }

    /** @hidden @internal */
    _setWeight(value: number): void {}

    /** @hidden @internal */
    _getPrefSize(orientation: Orientation): number {
        return this._model.getSplitterSize();
    }

    /** @hidden @internal */
    _updateAttrs(json: any): void {}

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
