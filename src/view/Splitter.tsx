import * as React from "react";
import DragDrop from "../DragDrop";
import Actions from "../model/Actions";
import BorderNode from "../model/BorderNode";
import Node from "../model/Node";
import RowNode from "../model/RowNode";
import SplitterNode from "../model/SplitterNode";
import Orientation from "../Orientation";
import Layout from "./Layout";

/** @hidden @internal */
export interface ISplitterProps {
    layout: Layout;
    node: SplitterNode;
}

/** @hidden @internal */
export class Splitter extends React.Component<ISplitterProps, any> {

    pBounds?: number[];
    outlineDiv?: HTMLDivElement;

    onMouseDown = (event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
        DragDrop.instance.startDrag(event, 
            this.onDragStart, 
            this.onDragMove, 
            this.onDragEnd, 
            this.onDragCancel,
            undefined,
            undefined,
            this.props.layout.getCurrentDocument()
            );
        const parentNode = this.props.node.getParent() as RowNode;
        this.pBounds = parentNode._getSplitterBounds(this.props.node);
        const rootdiv = this.props.layout.selfRef.current!;
        this.outlineDiv = this.props.layout.getCurrentDocument()!.createElement("div");
        this.outlineDiv.style.position = "absolute";
        this.outlineDiv.className = this.props.layout.getClassName("flexlayout__splitter_drag");
        this.outlineDiv.style.cursor = this.props.node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize";
        this.props.node.getRect().positionElement(this.outlineDiv);
        rootdiv.appendChild(this.outlineDiv);
    }

    onDragCancel = (wasDragging: boolean) => {
        const rootdiv = this.props.layout.selfRef.current!;
        rootdiv.removeChild(this.outlineDiv as Element);
    }

    onDragStart = () => {

        return true;
    }

    onDragMove = (event: React.MouseEvent<Element, MouseEvent>) => {
        const clientRect = this.props.layout.domRect;
        const pos = {
            x: event.clientX - clientRect.left,
            y: event.clientY - clientRect.top
        };

        const outlineDiv = this.outlineDiv as HTMLDivElement;

        if (this.props.node.getOrientation() === Orientation.HORZ) {
            outlineDiv.style.top = this.getBoundPosition(pos.y - 4) + "px";
        }
        else {
            outlineDiv.style.left = this.getBoundPosition(pos.x - 4) + "px";
        }
    }

    onDragEnd = () => {
        const node = this.props.node;
        const parentNode = node.getParent() as RowNode;
        let value = 0;
        const outlineDiv = this.outlineDiv as HTMLDivElement;
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

        const rootdiv = this.props.layout.selfRef.current!;
        rootdiv.removeChild(this.outlineDiv as HTMLDivElement);
    }

    getBoundPosition(p: number) {
        const bounds = this.pBounds as number[];
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
        const cm = this.props.layout.getClassName;

        const node = this.props.node;
        const style = node._styleWithPosition(
            {
                cursor: this.props.node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize"
            }
        );

        return  <div
            style={style}
            onTouchStart={this.onMouseDown}
            onMouseDown={this.onMouseDown}
            className={cm("flexlayout__splitter")}/>;
    }
}

// export default Splitter;
