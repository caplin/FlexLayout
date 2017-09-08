'use strict';

import * as React from "react";
import * as ReactDOM from "react-dom";
import Rect from "../Rect";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import Model from "../model/Model";
import Layout from "./Layout";

/** @hidden @internal */
export interface IBorderButtonProps {
    layout: Layout,
    node: TabNode,
    selected: boolean,
    border:string
}

/** @hidden @internal */
export class BorderButton extends React.Component<IBorderButtonProps, any> {
    selfRef: HTMLDivElement;
    contentsRef: HTMLDivElement;

    private contentWidth: number;

    constructor(props:IBorderButtonProps) {
        super(props);
    }

    onMouseDown(event:Event) {
        this.props.layout.dragStart(event, "Move: " + this.props.node.getName(), this.props.node, this.props.node.isEnableDrag(), this.onClick.bind(this), null);
    }

    onClick(event:React.MouseEvent<HTMLDivElement>) {
        const node = this.props.node;
        this.props.layout.doAction(Actions.selectTab(node.getId()));
    }

    onClose(event:React.MouseEvent<HTMLDivElement>) {
        const node = this.props.node;
        this.props.layout.doAction(Actions.deleteTab(node.getId()));
    }

    onCloseMouseDown(event:React.MouseEvent<HTMLDivElement>) {
        event.stopPropagation();
    }

    componentDidMount() {
        this.updateRect();
    }

    componentDidUpdate() {
        this.updateRect();
    }

    updateRect() {
        // record position of tab in border
        const clientRect = (ReactDOM.findDOMNode(this.props.layout) as Element).getBoundingClientRect();
        const r = (this.selfRef as Element).getBoundingClientRect();
        this.props.node.setTabRect(new Rect(r.left - clientRect.left, r.top - clientRect.top, r.width, r.height));
        this.contentWidth = (this.contentsRef as Element).getBoundingClientRect().width;
    }

    render() {
        let classNames = "flexlayout__border_button flexlayout__border_button_" + this.props.border;
        const node = this.props.node;

        if (this.props.selected) {
            classNames += " flexlayout__border_button--selected";
        }
        else {
            classNames += " flexlayout__border_button--unselected";
        }

        if (this.props.node.getClassName() != null) {
            classNames += " " + this.props.node.getClassName();
        }

        let leadingContent = null;

        if (node.getIcon() != null) {
            leadingContent = <img src={node.getIcon()}/>;
        }

        const content = <div ref={ref => this.contentsRef = ref} className="flexlayout__border_button_content">{node.getName()}</div>;

        let closeButton = null;
        if (this.props.node.isEnableClose()) {
            closeButton = <div className={"flexlayout__border_button_trailing"}
                               onMouseDown={this.onCloseMouseDown.bind(this)}
                               onClick={this.onClose.bind(this)}
                               onTouchStart={this.onCloseMouseDown.bind(this)}
                />;
        }

        return <div ref={ref => this.selfRef = ref}
                    style={{}}
                    className={classNames}
                    onMouseDown={this.onMouseDown.bind(this)}
                    onTouchStart={this.onMouseDown.bind(this)}>
            {leadingContent}
            {content}
            {closeButton}
        </div>;
    }
}

// export default BorderButton;