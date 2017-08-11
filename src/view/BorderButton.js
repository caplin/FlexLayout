'use strict';

import React from "react";
import ReactDOM from "react-dom";
import Rect from "../Rect.js";
import Actions from "../model/Actions.js";

class BorderButton extends React.Component {

    constructor(props) {
        super(props);
    }

    onMouseDown(event) {
        this.props.layout.dragStart(event, "Move: " + this.props.node.getName(), this.props.node, this.props.node.isEnableDrag(), this.onClick.bind(this), null);
    }

    onClick(event) {
        let node = this.props.node;
        this.props.layout.doAction(Actions.selectTab(node.getId()));
    }

    onClose(event) {
        let node = this.props.node;
        this.props.layout.doAction(Actions.deleteTab(node.getId()));
    }

    onCloseMouseDown(event) {
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
        let clientRect = ReactDOM.findDOMNode(this.props.layout).getBoundingClientRect();
        let r = this.refs.self.getBoundingClientRect();
        this.props.node.setTabRect(new Rect(r.left - clientRect.left, r.top - clientRect.top, r.width, r.height));
        this.contentWidth = this.refs.contents.getBoundingClientRect().width;
    }

    render() {
        let classNames = "flexlayout__border_button flexlayout__border_button_" + this.props.border.getLocation().getName();
        let node = this.props.node;

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

        let content = <div ref="contents" className="flexlayout__border_button_content">{node.getName()}</div>;

        let closeButton = null;
        if (this.props.node.isEnableClose()) {
            closeButton = <div className={"flexlayout__border_button_trailing"}
                               onMouseDown={this.onCloseMouseDown.bind(this)}
                               onClick={this.onClose.bind(this)}
                               onTouchStart={this.onCloseMouseDown.bind(this)}
                />;
        }

        return <div ref="self"
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

export default BorderButton;