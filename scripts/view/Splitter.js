import React from "react";
import ReactDOM from "react-dom";
import DragDrop from "../DragDrop.js";
import Orientation from "../Orientation.js";
import Actions from "../model/Actions.js";

class Splitter extends React.Component
{
    onMouseDown(event)
    {
        DragDrop.instance.startDrag(event, this.onDragStart.bind(this), this.onDragMove.bind(this), this.onDragEnd.bind(this), this.onDragCancel.bind(this));
    }

    onDragCancel()
    {
        var rootdiv = ReactDOM.findDOMNode(this.props.layout);
        rootdiv.removeChild(this.outlineDiv);
    }

    onDragStart(event)
    {
        this.pBounds = this.props.node.getParent()._getSplitterBounds(this.props.node);
        var rootdiv = ReactDOM.findDOMNode(this.props.layout);
        this.outlineDiv = document.createElement("div");
        this.outlineDiv.style.position = "absolute";
        this.outlineDiv.className = "flexlayout__splitter_drag";
        this.outlineDiv.style.cursor = this.props.node.getOrientation() == Orientation.HORZ?"ns-resize":"ew-resize";
        this.props.node.getRect().positionElement(this.outlineDiv);
        rootdiv.appendChild(this.outlineDiv);
        return true;
    }

    onDragMove(event)
    {
        var clientRect = ReactDOM.findDOMNode(this.props.layout).getBoundingClientRect();
        var pos = {
            x: event.clientX - clientRect.left,
            y: event.clientY - clientRect.top
        };

        if (this.props.node.getOrientation() == Orientation.HORZ)
        {
            this.outlineDiv.style.top = this.getBoundPosition(pos.y-4) + "px";
        }
        else
        {
            this.outlineDiv.style.left = this.getBoundPosition(pos.x-4) + "px";
        }
    }

    onDragEnd(event)
    {
        var node = this.props.node;
        var value = 0;
        if (node.getOrientation() == Orientation.HORZ)
        {
            value = this.outlineDiv.offsetTop;
        }
        else
        {
            value = this.outlineDiv.offsetLeft;
        }
        this.props.layout.doAction(Actions.adjustSplit(node, value));
        //{name:"adjustSplit", nodeKey:node.getKey(), value:value});

        var rootdiv = ReactDOM.findDOMNode(this.props.layout);
        rootdiv.removeChild(this.outlineDiv);
    }

    getBoundPosition(p)
    {
        var rtn = p;
        if (p < this.pBounds[0])
        {
            rtn = this.pBounds[0];
        }
        if (p > this.pBounds[1])
        {
            rtn = this.pBounds[1];
        }

        return rtn;
    }

    render()
    {
        var node = this.props.node;
        var style = node._styleWithPosition(
            {
                cursor: this.props.node.getOrientation() == Orientation.HORZ?"ns-resize":"ew-resize"
            }
        );

        return <div style={style} onTouchStart={this.onMouseDown.bind(this)} onMouseDown={this.onMouseDown.bind(this)} className="flexlayout__splitter"></div>;
    }
}

export default Splitter;