import Node from "./Node.js";

class SplitterNode extends Node
{
    constructor(model)
    {
        super("splitter", model);

        this.size = 8;
        this.fixed = true;
    }
}

export default SplitterNode;