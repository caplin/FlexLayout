import React from "react";
import ReactDOM from "react-dom";
import DragDrop from "../DragDrop.js";
import Orientation from "../Orientation.js";
import BorderNode from "../model/BorderNode.js";
import Actions from "../model/Actions.js";

class Splitter extends React.Component {

    onMouseDown(event) {
        DragDrop.instance.startDrag(event, this.onDragStart.bind(this), this.onDragMove.bind(this), this.onDragEnd.bind(this), this.onDragCancel.bind(this));
    }

    onDragCancel() {
        let rootdiv = ReactDOM.findDOMNode(this.props.layout);
        rootdiv.removeChild(this.outlineDiv);
    }

    onDragStart(event) {
        this.pBounds = this.props.node.getParent()._getSplitterBounds(this.props.node);
        let rootdiv = ReactDOM.findDOMNode(this.props.layout);
        this.outlineDiv = document.createElement("div");
        this.outlineDiv.style.position = "absolute";
        this.outlineDiv.className = "flexlayout__splitter_drag";
        this.outlineDiv.style.cursor = this.props.node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize";
        this.props.node.getRect().positionElement(this.outlineDiv);
        rootdiv.appendChild(this.outlineDiv);
        return true;
    }

    onDragMove(event) {
        let clientRect = ReactDOM.findDOMNode(this.props.layout).getBoundingClientRect();
        let pos = {
            x: event.clientX - clientRect.left,
            y: event.clientY - clientRect.top
        };

        if (this.props.node.getOrientation() === Orientation.HORZ) {
            this.outlineDiv.style.top = this.getBoundPosition(pos.y - 4) + "px";
        }
        else {
            this.outlineDiv.style.left = this.getBoundPosition(pos.x - 4) + "px";
        }
    }

    onDragEnd(event) {
        let node = this.props.node;
        let value = 0;
        if (node.getOrientation() === Orientation.HORZ) {
            value = this.outlineDiv.offsetTop;
        }
        else {
            value = this.outlineDiv.offsetLeft;
        }

        if (node.getParent().getType() == BorderNode.TYPE) {
            let pos = node.getParent()._calculateSplit(node, value);
            this.props.layout.doAction(Actions.adjustBorderSplit(node.getParent().getId(), pos));
        }
        else {
            let splitSpec = node.getParent()._calculateSplit(this.props.node, value);
            this.props.layout.doAction(Actions.adjustSplit(splitSpec));
        }

        let rootdiv = ReactDOM.findDOMNode(this.props.layout);
        rootdiv.removeChild(this.outlineDiv);
    }

    getBoundPosition(p) {
        let rtn = p;
        if (p < this.pBounds[0]) {
            rtn = this.pBounds[0];
        }
        if (p > this.pBounds[1]) {
            rtn = this.pBounds[1];
        }

        return rtn;
    }

    render() {
        let node = this.props.node;
        let style = node._styleWithPosition(
            {
                cursor: this.props.node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize"
            }
        );

        return <div style={style} onTouchStart={this.onMouseDown.bind(this)} onMouseDown={this.onMouseDown.bind(this)}
                    className="flexlayout__splitter"></div>;
    }
}

export default Splitter;