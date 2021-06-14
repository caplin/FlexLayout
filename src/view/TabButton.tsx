import * as React from "react";
import { I18nLabel } from "../I18nLabel";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import Rect from "../Rect";
import { IIcons, ILayoutCallbacks, ITitleObject } from "./Layout";
import { ICloseType } from "../model/ICloseType";
import { CLASSES } from "../Types";

/** @hidden @internal */
export interface ITabButtonProps {
    layout: ILayoutCallbacks;
    node: TabNode;
    show: boolean;
    selected: boolean;
    height: number;
    iconFactory?: (node: TabNode) => React.ReactNode | undefined;
    titleFactory?: (node: TabNode) => React.ReactNode | undefined;
    icons?: IIcons;
}

/** @hidden @internal */
export const TabButton = (props: ITabButtonProps) => {
    const { layout, node, show, selected, iconFactory, titleFactory, icons } = props;
    const selfRef = React.useRef<HTMLDivElement | null>(null);
    const contentRef = React.useRef<HTMLInputElement | null>(null);
    const contentWidth = React.useRef<number>(0);

    const onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
        if (!layout.getEditingTab()) {
            const message = layout.i18nName(I18nLabel.Move_Tab, node.getName());
            layout.dragStart(event, message, node, node.isEnableDrag(), onClick, onDoubleClick);
        }
    };

    const onClick = () => {
        layout.doAction(Actions.selectTab(node.getId()));
    };

    const onDoubleClick = (event: Event) => {
        if (node.isEnableRename()) {
            layout.setEditingTab(node);
            layout.getCurrentDocument()!.body.addEventListener("mousedown", onEndEdit);
            layout.getCurrentDocument()!.body.addEventListener("touchstart", onEndEdit);
        } 
        // else {
        //     const parentNode = node.getParent() as TabSetNode;
        //     if (parentNode.canMaximize()) {
        //         layout.maximize(parentNode);
        //     }
        // }
    };

    const onEndEdit = (event: Event) => {
        if (event.target !== contentRef.current!) {
            layout.getCurrentDocument()!.body.removeEventListener("mousedown", onEndEdit);
            layout.getCurrentDocument()!.body.removeEventListener("touchstart", onEndEdit);
            layout.setEditingTab(undefined);
        }
    };

    const isClosable = () => {
        const closeType = node.getCloseType();
        if (selected || closeType === ICloseType.Always) {
            return true;
        }
        if (closeType === ICloseType.Visible) {
            // not selected but x should be visible due to hover
            if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                return true;
            }
        }
        return false;
    };

    const onClose = (event: React.MouseEvent<HTMLDivElement>) => {
        if (isClosable()) {
            layout.doAction(Actions.deleteTab(node.getId()));
        } else {
            onClick();
        }
    };

    const onCloseMouseDown = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        event.stopPropagation();
    };

    React.useLayoutEffect(() => {
        updateRect();
        if (layout.getEditingTab() === node) {
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
        if (event.keyCode === 27) {
            // esc
            layout.setEditingTab(undefined);
        } else if (event.keyCode === 13) {
            // enter
            layout.setEditingTab(undefined);
            layout.doAction(Actions.renameTab(node.getId(), (event.target as HTMLInputElement).value));
        }
    };

    const cm = layout.getClassName;
    const parentNode = node.getParent() as TabSetNode;

    let baseClassName = CLASSES.FLEXLAYOUT__TAB_BUTTON;
    let classNames = cm(baseClassName);
    classNames += " " + cm(baseClassName + "_" + parentNode.getTabLocation());

    if (selected) {
        classNames += " " + cm(baseClassName + "--selected");
    } else {
        classNames += " " + cm(baseClassName + "--unselected");
    }

    if (node.getClassName() !== undefined) {
        classNames += " " + node.getClassName();
    }

    let leadingContent = iconFactory ? iconFactory(node) : undefined;
    let titleContent: React.ReactNode = node.getName();
    let name = node.getName();

    function isTitleObject(obj: any): obj is ITitleObject {
        return obj.titleContent !== undefined 
      }

    if (titleFactory !== undefined) {
        const titleObj = titleFactory(node);
        if (titleObj !== undefined) {
            if (typeof titleObj === "string") {
                titleContent = titleObj as string;
                name = titleObj as string;
            } else if (isTitleObject(titleObj)) {
                titleContent = titleObj.titleContent;
                name = titleObj.name;
            } else {
                titleContent = titleObj;
            }
        }
    }

    if (typeof leadingContent === undefined && typeof node.getIcon() !== undefined) {
        leadingContent = <img src={node.getIcon()} alt="leadingContent" />;
    }

    let buttons: any[] = [];

    // allow customization of leading contents (icon) and contents
    const renderState = { leading: leadingContent, content: titleContent, name, buttons };
    layout.customizeTab(node, renderState);

    node._setRenderedName(renderState.name);

    let content = (
        <div ref={contentRef} className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_CONTENT)}>
            {renderState.content}
        </div>
    );
    const leading = <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_LEADING)}>{renderState.leading}</div>;

    if (layout.getEditingTab() === node) {
        const contentStyle = { width: contentWidth + "px" };
        content = (
            <input
                style={contentStyle}
                ref={contentRef}
                className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_TEXTBOX)}
                type="text"
                autoFocus={true}
                defaultValue={node.getName()}
                onKeyDown={onTextBoxKeyPress}
                onMouseDown={onTextBoxMouseDown}
                onTouchStart={onTextBoxMouseDown}
            />
        );
    }

    if (node.isEnableClose()) {
        const closeTitle = layout.i18nName(I18nLabel.Close_Tab);
        buttons.push(
            <div key="close" title={closeTitle} className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_TRAILING)} onMouseDown={onCloseMouseDown} onClick={onClose} onTouchStart={onCloseMouseDown}>
                {icons?.close}
            </div>
        );
    }

    return (
        <div
            ref={selfRef}
            style={{
                visibility: show ? "visible" : "hidden",
            }}
            className={classNames}
            onMouseDown={onMouseDown}
            onTouchStart={onMouseDown}
        >
            {leading}
            {content}
            {buttons}
        </div>
    );
};
