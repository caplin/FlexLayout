import React from "react";
import ReactDOM from "react-dom";
import DragDrop from "../DragDrop.js";
import Orientation from "../Orientation.js";

class Splitter extends React.Component
{
    onMouseDown(event)
    {
        DragDrop.instance.startDrag(event, this.onDragStart.bind(this), this.onDragMove.bind(this), this.onDragEnd.bind(this), null);
    }

    onDragStart(event)
    {
        this.pBounds = this.props.node.parent.getSplitterBounds(this.props.node);
        var rootdiv = ReactDOM.findDOMNode(this.props.layout);
        this.outlineDiv = document.createElement("div");
        this.outlineDiv.style.position = "absolute";
        this.outlineDiv.className = "flexlayout__splitter_drag";
        this.outlineDiv.style.cursor = this.props.node.parent.orientation == Orientation.VERT?"ns-resize":"ew-resize";
        this.props.node.rect.positionElement(this.outlineDiv);
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

        if (this.props.node.orientation == Orientation.HORZ)
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
        if (this.props.node.orientation == Orientation.HORZ)
        {
            this.props.node.parent.adjustSplit(this.props.node, this.outlineDiv.offsetTop);
        }
        else
        {
            this.props.node.parent.adjustSplit(this.props.node, this.outlineDiv.offsetLeft);
        }

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
        var style = node.styleWithPosition(
            {
                cursor: this.props.node.parent.orientation == Orientation.VERT?"ns-resize":"ew-resize"
            }
        );

        return <div style={style} onMouseDown={this.onMouseDown.bind(this)} className="flexlayout__splitter"></div>;
    }
}

export default Splitter;