import * as React from "react";
import { I18nLabel } from "..";
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
    iconFactory?: (node: TabNode) => React.ReactNode | undefined;
    titleFactory?: (node: TabNode) => React.ReactNode | undefined;
    closeIcon?: React.ReactNode;
}

/** @hidden @internal */
export class BorderButton extends React.Component<IBorderButtonProps, any> {
    selfRef: React.RefObject<HTMLDivElement>;

    constructor(props: IBorderButtonProps) {
        super(props);
        this.selfRef = React.createRef<HTMLDivElement>();
      }

    onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
        const message = this.props.layout.i18nName(I18nLabel.Move_Tab, this.props.node.getName());
        this.props.layout.dragStart(
            event,
            message,
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
        const clientRect = this.props.layout.domRect;
        const r = this.selfRef.current!.getBoundingClientRect();
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

        let leadingContent = this.props.iconFactory ? this.props.iconFactory(node) : undefined;
        const titleContent = (this.props.titleFactory ? this.props.titleFactory(node) : undefined) || node.getName();

        if (typeof leadingContent === undefined && typeof node.getIcon() !== undefined) {
            leadingContent = <img src={node.getIcon()} alt="leadingContent"/>;
        }

        // allow customization of leading contents (icon) and contents
        const renderState = { leading: leadingContent, content: titleContent };
        this.props.layout.customizeTab(node, renderState);

        const content = <div className={cm("flexlayout__border_button_content")}>{renderState.content}</div>;
        const leading = <div className={cm("flexlayout__border_button_leading")}>{renderState.leading}</div>;


        let closeButton;
        if (this.props.node.isEnableClose()) {
            closeButton = <div className={cm("flexlayout__border_button_trailing")}
                onMouseDown={this.onCloseMouseDown}
                onClick={this.onClose}
                onTouchStart={this.onCloseMouseDown}
            >{this.props.closeIcon}</div>;
        }

        return <div ref={this.selfRef}
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
