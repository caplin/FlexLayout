import { AttributeDefinitions } from "../AttributeDefinitions";
import { Orientation } from "../Orientation";
import { Model } from "./Model";
import { Node } from "./Node";

export class SplitterNode extends Node {
    static readonly TYPE: string = "splitter";

    /** @internal */
    constructor(model: Model) {
        super(model);
        this._fixed = true;
        this._attributes.type = SplitterNode.TYPE;
        model._addNode(this);
    }

    /** @internal */
    getWidth() {
        return this._model.getSplitterSize();
    }

    /** @internal */
    getMinWidth() {
        if (this.getOrientation() === Orientation.VERT) {
            return this._model.getSplitterSize();
        } else {
            return 0;
        }
    }

    /** @internal */
    getHeight() {
        return this._model.getSplitterSize();
    }

    /** @internal */
    getMinHeight() {
        if (this.getOrientation() === Orientation.HORZ) {
            return this._model.getSplitterSize();
        } else {
            return 0;
        }
    }

    /** @internal */
    getMinSize(orientation: Orientation) {
        if (orientation === Orientation.HORZ) {
            return this.getMinWidth();
        } else {
            return this.getMinHeight();
        }
    }

    /** @internal */
    getWeight(): number {
        return 0;
    }

    /** @internal */
    _setWeight(value: number): void { }

    /** @internal */
    _getPrefSize(orientation: Orientation): number {
        return this._model.getSplitterSize();
    }

    /** @internal */
    _updateAttrs(json: any): void { }

    /** @internal */
    _getAttributeDefinitions(): AttributeDefinitions {
        return new AttributeDefinitions();
    }

    toJson(): undefined {
        return undefined;
    }
}
