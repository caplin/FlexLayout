import Node from "./Node.js";

class SplitterNode extends Node
{
    constructor(model)
    {
        super(model);
        this._type = SplitterNode.TYPE;
        this._width = 20;
        this._height = 20;
        this._fixed = true;
        model._addNode(this);
    }
}

SplitterNode.TYPE = "splitter";

export default SplitterNode;