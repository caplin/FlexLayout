'use strict';

import * as React from "react";
import * as ReactDOM from "react-dom";
import Rect from "../Rect";
import PopupMenu from "../PopupMenu";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import Layout from "./Layout";

/** @hidden @internal */
export interface ITabButtonProps {
    layout: Layout,
    node: TabNode,
    show: boolean,
    selected: boolean,
    height: number
}

/** @hidden @internal */
export class TabButton extends React.Component<ITabButtonProps, any> {
    selfRef: HTMLDivElement;

    contentWidth: number;
    contentRef: Element;

    constructor(props: ITabButtonProps) {
        super(props);
        this.state = { editing: false };
        this.onEndEdit = this.onEndEdit.bind(this);
    }

    onMouseDown(event: Event) {
        this.props.layout.dragStart(event, "Move: " + this.props.node.getName(), this.props.node, this.props.node.isEnableDrag(), this.onClick.bind(this), this.onDoubleClick.bind(this));
    }

    onClick(event: Event) {
        const node = this.props.node;
        this.props.layout.doAction(Actions.selectTab(node.getId()));
    }

    onDoubleClick(event: Event) {
        if (this.props.node.isEnableRename()) {
            this.setState({ editing: true });
            document.body.addEventListener("mousedown", this.onEndEdit);
            document.body.addEventListener("touchstart", this.onEndEdit);
        }
        else {
            let parentNode = this.props.node.getParent() as TabSetNode;
            if (parentNode.isEnableMaximize()) {
                this.props.layout.maximize(parentNode);
            }

        }
    }

    onEndEdit(event: Event) {
        if (event.target !== this.contentRef) {
            this.setState({ editing: false });
            document.body.removeEventListener("mousedown", this.onEndEdit);
            document.body.removeEventListener("touchstart", this.onEndEdit);
        }
    }

    onClose(event: React.MouseEvent<HTMLDivElement>) {
        const node = this.props.node;
        this.props.layout.doAction(Actions.deleteTab(node.getId()));
    }

    onCloseMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        event.stopPropagation();
    }

    componentDidMount() {
        this.updateRect();
    }

    componentDidUpdate() {
        this.updateRect();
        if (this.state.editing) {
            (this.contentRef as HTMLInputElement).select();
        }
    }

    updateRect() {
        // record position of tab in node
        const clientRect = (ReactDOM.findDOMNode(this.props.layout) as Element).getBoundingClientRect();
        const r = (this.selfRef as Element).getBoundingClientRect();
        this.props.node._setTabRect(new Rect(r.left - clientRect.left, r.top - clientRect.top, r.width, r.height));
        this.contentWidth = this.contentRef.getBoundingClientRect().width;
    }


    onTextBoxMouseDown(event: React.MouseEvent<HTMLInputElement>) {
        //console.log("onTextBoxMouseDown");
        event.stopPropagation();
    }

    onTextBoxKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        //console.log(event, event.keyCode);
        if (event.keyCode === 27) { // esc
            this.setState({ editing: false });
        }
        else if (event.keyCode === 13) { // enter
            this.setState({ editing: false });
            const node = this.props.node;
            this.props.layout.doAction(Actions.renameTab(node.getId(), (event.target as HTMLInputElement).value));
        }
    }

    doRename(node: TabNode, newName: string) {
        this.props.layout.doAction(Actions.renameTab(node.getId(), newName));
    }

    render() {
        let classNames = "flexlayout__tab_button";
        const node = this.props.node;

        if (this.props.selected) {
            classNames += " flexlayout__tab_button--selected";
        }
        else {
            classNames += " flexlayout__tab_button--unselected";
        }

        if (this.props.node.getClassName() != null) {
            classNames += " " + this.props.node.getClassName();
        }

        let leadingContent = null;

        if (node.getIcon() != null) {
            leadingContent = <img src={node.getIcon()} />;
        }

        // allow customization of leading contents (icon) and contents
        const renderState = { leading: leadingContent, content: node.getName() };
        this.props.layout.customizeTab(node, renderState);

        let content = <div ref={ref => this.contentRef = ref} className="flexlayout__tab_button_content">{renderState.content}</div>;
        const leading = <div className={"flexlayout__tab_button_leading"}>{renderState.leading}</div>;

        if (this.state.editing) {
            const contentStyle = { width: this.contentWidth + "px" };
            content = <input style={contentStyle}
                ref={ref => this.contentRef = ref}
                className="flexlayout__tab_button_textbox"
                type="text"
                autoFocus
                defaultValue={node.getName()}
                onKeyDown={this.onTextBoxKeyPress.bind(this)}
                onMouseDown={this.onTextBoxMouseDown.bind(this)}
                onTouchStart={this.onTextBoxMouseDown.bind(this)}
            />;
        }

        let closeButton = null;
        if (this.props.node.isEnableClose()) {
            closeButton = <div className={"flexlayout__tab_button_trailing"}
                onMouseDown={this.onCloseMouseDown.bind(this)}
                onClick={this.onClose.bind(this)}
                onTouchStart={this.onCloseMouseDown.bind(this)}
            />;
        }

        return <div ref={ref => this.selfRef = ref}
            style={{
                visibility: this.props.show ? "visible" : "hidden",
                height: this.props.height
            }}
            className={classNames}
            onMouseDown={this.onMouseDown.bind(this)}
            onTouchStart={this.onMouseDown.bind(this)}>
            {leading}
            {content}
            {closeButton}
        </div>;
    }
}

// export default TabButton;