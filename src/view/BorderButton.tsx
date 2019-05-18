import * as React from "react";
import * as ReactDOM from "react-dom";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import Rect from "../Rect";
import Layout from "./Layout";

/** @hidden @internal */
export interface IBorderButtonProps {
    layout: Layout;
    node: TabNode;
    selected: boolean;
    border: string;
}

/** @hidden @internal */
export class BorderButton extends React.Component<IBorderButtonProps, any> {
    selfRef?: HTMLDivElement;
    contentsRef?: HTMLDivElement;

    onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
        this.props.layout.dragStart(
            event,
            "Move: " + this.props.node.getName(),
            this.props.node, this.props.node.isEnableDrag(),
            this.onClick,
            (event2: Event) => undefined
        );  
    }

    onClick = () => {
        const node = this.props.node;
        this.props.layout.doAction(Actions.selectTab(node.getId()));
    }

    onClose = (event: React.MouseEvent<HTMLDivElement>) => {
        const node = this.props.node;
        this.props.layout.doAction(Actions.deleteTab(node.getId()));
    }

    onCloseMouseDown = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
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
        this.props.node._setTabRect(new Rect(r.left - clientRect.left, r.top - clientRect.top, r.width, r.height));
    }

    render() {
        const cm = this.props.layout.getClassName;
        let classNames = cm("flexlayout__border_button") + " " +
            cm("flexlayout__border_button_" + this.props.border);
        const node = this.props.node;

        if (this.props.selected) {
            classNames += " " + cm("flexlayout__border_button--selected");
        }
        else {
            classNames += " " + cm("flexlayout__border_button--unselected");
        }

        if (this.props.node.getClassName() !== undefined) {
            classNames += " " + this.props.node.getClassName();
        }

        let leadingContent;

        if (node.getIcon() !== undefined) {
            leadingContent = <img src={node.getIcon()} alt="leadingContent"/>;
        }



        // allow customization of leading contents (icon) and contents
        const renderState = { leading: leadingContent, content: node.getName() };
        this.props.layout.customizeTab(node, renderState);

        const content = <div ref={ref => this.contentsRef = (ref === null) ? undefined : ref} className={cm("flexlayout__border_button_content")}>{renderState.content}</div>;
        const leading = <div className={cm("flexlayout__border_button_leading")}>{renderState.leading}</div>;


        let closeButton;
        if (this.props.node.isEnableClose()) {
            closeButton = <div className={cm("flexlayout__border_button_trailing")}
                onMouseDown={this.onCloseMouseDown}
                onClick={this.onClose}
                onTouchStart={this.onCloseMouseDown}
            />;
        }

        return <div ref={ref => this.selfRef = (ref === null) ? undefined : ref}
            style={{}}
            className={classNames}
            onMouseDown={this.onMouseDown}
            onTouchStart={this.onMouseDown}>
            {leading}
            {content}
            {closeButton}
        </div>;
    }
}

// export default BorderButton;
