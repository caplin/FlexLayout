import Node from "./Node.js";

class SplitterNode extends Node
{
    constructor(model)
    {
        super(model);
        this._type = SplitterNode.TYPE;
        this._width = 8;
        this._height = 8;
        this._fixed = true;
        model._addNode(this);
    }
}

SplitterNode.TYPE = "splitter";

export default SplitterNode;