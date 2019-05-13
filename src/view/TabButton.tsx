import * as React from "react";
import * as ReactDOM from "react-dom";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import Rect from "../Rect";
import Layout from "./Layout";

/** @hidden @internal */
export interface ITabButtonProps {
    layout: Layout;
    node: TabNode;
    show: boolean;
    selected: boolean;
    height: number;
}

/** @hidden @internal */
export class TabButton extends React.Component<ITabButtonProps, any> {
    public selfRef?: HTMLDivElement;

    public contentWidth: number = 0;
    public contentRef?: Element;

    constructor(props: ITabButtonProps) {
        super(props);
        this.state = { editing: false };
        this.onEndEdit = this.onEndEdit.bind(this);
    }

    public onMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) {
        this.props.layout.dragStart(event, "Move: " + this.props.node.getName(), this.props.node, this.props.node.isEnableDrag(), this.onClick.bind(this), this.onDoubleClick.bind(this));
    }

    public onClick(event: Event) {
        const node = this.props.node;
        this.props.layout.doAction(Actions.selectTab(node.getId()));
    }

    public onDoubleClick(event: Event) {
        if (this.props.node.isEnableRename()) {
            this.setState({ editing: true });
            document.body.addEventListener("mousedown", this.onEndEdit);
            document.body.addEventListener("touchstart", this.onEndEdit);
        }
        else {
            const parentNode = this.props.node.getParent() as TabSetNode;
            if (parentNode.isEnableMaximize()) {
                this.props.layout.maximize(parentNode);
            }

        }
    }

    public onEndEdit(event: Event) {
        if (event.target !== this.contentRef) {
            this.setState({ editing: false });
            document.body.removeEventListener("mousedown", this.onEndEdit);
            document.body.removeEventListener("touchstart", this.onEndEdit);
        }
    }

    public onClose(event: React.MouseEvent<HTMLDivElement>) {
        const node = this.props.node;
        this.props.layout.doAction(Actions.deleteTab(node.getId()));
    }

    public onCloseMouseDown(event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
        event.stopPropagation();
    }

    public componentDidMount() {
        this.updateRect();
    }

    public componentDidUpdate() {
        this.updateRect();
        if (this.state.editing) {
            (this.contentRef as HTMLInputElement).select();
        }
    }

    public updateRect() {
        // record position of tab in node
        const clientRect = (ReactDOM.findDOMNode(this.props.layout) as Element).getBoundingClientRect();
        const r = (this.selfRef as Element).getBoundingClientRect();
        this.props.node._setTabRect(new Rect(r.left - clientRect.left, r.top - clientRect.top, r.width, r.height));
        this.contentWidth = (this.contentRef as Element).getBoundingClientRect().width;
    }


    public onTextBoxMouseDown(event: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) {
        // console.log("onTextBoxMouseDown");
        event.stopPropagation();
    }

    public onTextBoxKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        // console.log(event, event.keyCode);
        if (event.keyCode === 27) { // esc
            this.setState({ editing: false });
        }
        else if (event.keyCode === 13) { // enter
            this.setState({ editing: false });
            const node = this.props.node;
            this.props.layout.doAction(Actions.renameTab(node.getId(), (event.target as HTMLInputElement).value));
        }
    }

    public doRename(node: TabNode, newName: string) {
        this.props.layout.doAction(Actions.renameTab(node.getId(), newName));
    }

    public render() {
        const cm = this.props.layout.getClassName;

        let classNames = cm("flexlayout__tab_button");
        const node = this.props.node;

        if (this.props.selected) {
            classNames += " " + cm("flexlayout__tab_button--selected");
        }
        else {
            classNames += " " + cm("flexlayout__tab_button--unselected");
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

        let content = <div ref={ref => this.contentRef = (ref === null) ? undefined : ref} className={cm("flexlayout__tab_button_content")}>{renderState.content}</div>;
        const leading = <div className={cm("flexlayout__tab_button_leading")}>{renderState.leading}</div>;

        if (this.state.editing) {
            const contentStyle = { width: this.contentWidth + "px" };
            content = <input style={contentStyle}
                ref={ref => this.contentRef = (ref === null) ? undefined : ref}
                className={cm("flexlayout__tab_button_textbox")}
                type="text"
                autoFocus={true}
                defaultValue={node.getName()}
                onKeyDown={this.onTextBoxKeyPress.bind(this)}
                onMouseDown={this.onTextBoxMouseDown.bind(this)}
                onTouchStart={this.onTextBoxMouseDown.bind(this)}
            />;
        }

        let closeButton;
        if (this.props.node.isEnableClose()) {
            closeButton = <div className={cm("flexlayout__tab_button_trailing")}
                onMouseDown={this.onCloseMouseDown.bind(this)}
                onClick={this.onClose.bind(this)}
                onTouchStart={this.onCloseMouseDown.bind(this)}
            />;
        }

        return <div ref={ref => this.selfRef = (ref === null) ? undefined : ref}
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
