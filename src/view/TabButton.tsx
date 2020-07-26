import * as React from "react";
import {I18nLabel} from "../I18nLabel";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import Rect from "../Rect";
import {ILayoutCallbacks} from "./Layout";

/** @hidden @internal */
export interface ITabButtonProps {
    layout: ILayoutCallbacks;
    node: TabNode;
    show: boolean;
    selected: boolean;
    height: number;
    iconFactory?: (node: TabNode) => React.ReactNode | undefined;
    titleFactory?: (node: TabNode) => React.ReactNode | undefined;
    closeIcon?: React.ReactNode;
}

/** @hidden @internal */
export const TabButton = (props: ITabButtonProps) => {
    const {layout, node, show, selected, height, iconFactory, titleFactory, closeIcon} = props;
    const selfRef = React.useRef<HTMLDivElement | null>(null);
    const contentRef = React.useRef<HTMLInputElement | null>(null);
    const contentWidth = React.useRef<number>(0);
    const [editing, setEditing] = React.useState<boolean>(false);

    const onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
        const message = layout.i18nName(I18nLabel.Move_Tab, node.getName());
        layout.dragStart(event, message, node, node.isEnableDrag(), onClick, onDoubleClick);
    };

    const onClick = (event: Event) => {
        layout.doAction(Actions.selectTab(node.getId()));
    };

    const onDoubleClick = (event: Event) => {
        if (node.isEnableRename()) {
            setEditing(true);
            layout.getCurrentDocument()!.body.addEventListener("mousedown", onEndEdit);
            layout.getCurrentDocument()!.body.addEventListener("touchstart", onEndEdit);
        } else {
            const parentNode = node.getParent() as TabSetNode;
            if (parentNode.isEnableMaximize()) {
                layout.maximize(parentNode);
            }
        }
    };

    const onEndEdit = (event: Event) => {
        if (event.target !== contentRef.current!) {
            setEditing(false);
            layout.getCurrentDocument()!.body.removeEventListener("mousedown", onEndEdit);
            layout.getCurrentDocument()!.body.removeEventListener("touchstart", onEndEdit);
        }
    };

    const onClose = (event: React.MouseEvent<HTMLDivElement>) => {
        layout.doAction(Actions.deleteTab(node.getId()));
    };

    const onCloseMouseDown = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        event.stopPropagation();
    };

    React.useLayoutEffect(() => {
        updateRect();
        if (editing) {
            (contentRef.current! as HTMLInputElement).select();
        }
    });

    const updateRect = () => {
        // record position of tab in node
        const layoutRect = layout.getDomRect();
        const r = selfRef.current!.getBoundingClientRect();
        node._setTabRect(new Rect(r.left - layoutRect.left, r.top - layoutRect.top, r.width, r.height));
        contentWidth.current = contentRef.current!.getBoundingClientRect().width;
    };


    const onTextBoxMouseDown = (event: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
        // console.log("onTextBoxMouseDown");
        event.stopPropagation();
    };

    const onTextBoxKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // console.log(event, event.keyCode);
        if (event.keyCode === 27) { // esc
            setEditing(false);
        } else if (event.keyCode === 13) { // enter
            setEditing(false);
            layout.doAction(Actions.renameTab(node.getId(), (event.target as HTMLInputElement).value));
        }
    };

    const cm = layout.getClassName;
    let classNames = cm("flexlayout__tab_button");

    if (selected) {
        classNames += " " + cm("flexlayout__tab_button--selected");
    } else {
        classNames += " " + cm("flexlayout__tab_button--unselected");
    }

    if (node.getClassName() !== undefined) {
        classNames += " " + node.getClassName();
    }

    let leadingContent = iconFactory ? iconFactory(node) : undefined;
    const titleContent = (titleFactory ? titleFactory(node) : undefined) || node.getName();

    if (typeof leadingContent === undefined && typeof node.getIcon() !== undefined) {
        leadingContent = <img src={node.getIcon()} alt="leadingContent"/>;
    }

    // allow customization of leading contents (icon) and contents
    const renderState = {leading: leadingContent, content: titleContent};
    layout.customizeTab(node, renderState);

    let content = <div ref={contentRef} className={cm("flexlayout__tab_button_content")}>{renderState.content}</div>;
    const leading = <div className={cm("flexlayout__tab_button_leading")}>{renderState.leading}</div>;

    if (editing) {
        const contentStyle = {width: contentWidth + "px"};
        content = <input style={contentStyle}
                         ref={contentRef}
                         className={cm("flexlayout__tab_button_textbox")}
                         type="text"
                         autoFocus={true}
                         defaultValue={node.getName()}
                         onKeyDown={onTextBoxKeyPress}
                         onMouseDown={onTextBoxMouseDown}
                         onTouchStart={onTextBoxMouseDown}
        />;
    }

    let closeButton;
    if (node.isEnableClose()) {
        closeButton = <div className={cm("flexlayout__tab_button_trailing")}
                           onMouseDown={onCloseMouseDown}
                           onClick={onClose}
                           onTouchStart={onCloseMouseDown}
        >{closeIcon}</div>;
    }

    return <div ref={selfRef}
                style={{
                    visibility: show ? "visible" : "hidden",
                    height: height
                }}
                className={classNames}
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}>
        {leading}
        {content}
        {closeButton}
    </div>;
};
