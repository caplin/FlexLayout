import Node from "./Node.js";

class SplitterNode extends Node {

    constructor(model) {
        super(model);
        this._fixed = true;
        this._visible = true;
        this._attributes["type"] = SplitterNode.TYPE;
        model._addNode(this);
    }

    getWidth() {
        return this._model.getSplitterSize();
    }

    getHeight() {
        return this._model.getSplitterSize();
    }

    _layout(rect) {
        super._layout(rect);
        this._setVisible(this._model.getMaximizedTabset() === null);
    }
}

SplitterNode.TYPE = "splitter";

export default SplitterNode;