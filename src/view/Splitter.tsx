import * as React from "react";
import * as ReactDOM from "react-dom";
import DragDrop from "../DragDrop";
import Orientation from "../Orientation";
import Node from "../model/Node";
import BorderNode from "../model/BorderNode";
import Actions from "../model/Actions";
import SplitterNode from "../model/SplitterNode";
import RowNode from "../model/RowNode";
import Layout from "./Layout";

/** @hidden @internal */
export interface ISplitterProps {
    layout: Layout,
    node: SplitterNode
}

/** @hidden @internal */
export class Splitter extends React.Component<ISplitterProps, any> {

    pBounds?: Array<number>;
    outlineDiv?: HTMLDivElement;

    onMouseDown(event: Event) {
        DragDrop.instance.startDrag(event, this.onDragStart.bind(this), this.onDragMove.bind(this), this.onDragEnd.bind(this), this.onDragCancel.bind(this));
        const parentNode = this.props.node.getParent() as RowNode;
        this.pBounds = parentNode._getSplitterBounds(this.props.node);
        const rootdiv = ReactDOM.findDOMNode(this.props.layout) as Element;
        this.outlineDiv = document.createElement("div");
        this.outlineDiv.style.position = "absolute";
        this.outlineDiv.className = this.props.layout.getClassName("flexlayout__splitter_drag");
        this.outlineDiv.style.cursor = this.props.node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize";
        this.props.node.getRect().positionElement(this.outlineDiv);
        rootdiv.appendChild(this.outlineDiv);
    }

    onDragCancel(wasDragging: boolean) {
        const rootdiv = ReactDOM.findDOMNode(this.props.layout) as Element;
        rootdiv.removeChild(this.outlineDiv as Element);
    }

    onDragStart(event: React.MouseEvent<HTMLDivElement>) {

        return true;
    }

    onDragMove(event: React.MouseEvent<HTMLDivElement>) {
        const clientRect = (ReactDOM.findDOMNode(this.props.layout) as Element).getBoundingClientRect();
        const pos = {
            x: event.clientX - clientRect.left,
            y: event.clientY - clientRect.top
        };

        let outlineDiv = this.outlineDiv as HTMLDivElement;

        if (this.props.node.getOrientation() === Orientation.HORZ) {
            outlineDiv.style.top = this.getBoundPosition(pos.y - 4) + "px";
        }
        else {
            outlineDiv.style.left = this.getBoundPosition(pos.x - 4) + "px";
        }
    }

    onDragEnd(event: React.MouseEvent<HTMLDivElement>, didDrag: boolean) {
        const node = this.props.node;
        const parentNode = node.getParent() as RowNode;
        let value = 0;
        let outlineDiv = this.outlineDiv as HTMLDivElement;
        if (node.getOrientation() === Orientation.HORZ) {
            value = outlineDiv.offsetTop;
        }
        else {
            value = outlineDiv.offsetLeft;
        }

        if (parentNode instanceof BorderNode) {
            const pos = (parentNode as BorderNode)._calculateSplit(node, value);
            this.props.layout.doAction(Actions.adjustBorderSplit((node.getParent() as Node).getId(), pos));
        }
        else {
            const splitSpec = parentNode._calculateSplit(this.props.node, value);
            if (splitSpec !== undefined) {
                this.props.layout.doAction(Actions.adjustSplit(splitSpec));
            }
        }

        const rootdiv = ReactDOM.findDOMNode(this.props.layout) as Element;
        rootdiv.removeChild(this.outlineDiv as HTMLDivElement);
    }

    getBoundPosition(p: number) {
        let bounds = this.pBounds as Array<number>;
        let rtn = p;
        if (p < bounds[0]) {
            rtn = bounds[0];
        }
        if (p > bounds[1]) {
            rtn = bounds[1];
        }

        return rtn;
    }

    render() {
        let cm = this.props.layout.getClassName;

        const node = this.props.node;
        const style = node._styleWithPosition(
            {
                cursor: this.props.node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize"
            }
        );

        return <div
            style={style}
            onTouchStart={this.onMouseDown.bind(this)}
            onMouseDown={this.onMouseDown.bind(this)}
            className={cm("flexlayout__splitter")}>
        </div>;
    }
}

// export default Splitter;
