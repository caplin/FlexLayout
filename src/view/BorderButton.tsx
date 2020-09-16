import * as React from "react";
import { I18nLabel } from "..";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import Rect from "../Rect";
import { IIcons, ILayoutCallbacks } from "./Layout";
import { ICloseType } from "../model/ICloseType";

/** @hidden @internal */
export interface IBorderButtonProps {
    layout: ILayoutCallbacks;
    node: TabNode;
    selected: boolean;
    border: string;
    iconFactory?: (node: TabNode) => React.ReactNode | undefined;
    titleFactory?: (node: TabNode) => React.ReactNode | undefined;
    icons?: IIcons;
}

/** @hidden @internal */
export const BorderButton = (props: IBorderButtonProps) => {
    const { layout, node, selected, border, iconFactory, titleFactory, icons } = props;
    const selfRef = React.useRef<HTMLDivElement | null>(null);

    const onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
        const message = layout.i18nName(I18nLabel.Move_Tab, node.getName());
        props.layout.dragStart(event, message, node, node.isEnableDrag(), onClick, (event2: Event) => undefined);
    };

    const onClick = () => {
        layout.doAction(Actions.selectTab(node.getId()));
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
    });

    const updateRect = () => {
        // record position of tab in border
        const clientRect = layout.getDomRect();
        const r = selfRef.current!.getBoundingClientRect();
        node._setTabRect(new Rect(r.left - clientRect.left, r.top - clientRect.top, r.width, r.height));
    };

    const cm = layout.getClassName;
    let classNames = cm("flexlayout__border_button") + " " + cm("flexlayout__border_button_" + border);

    if (selected) {
        classNames += " " + cm("flexlayout__border_button--selected");
    } else {
        classNames += " " + cm("flexlayout__border_button--unselected");
    }

    if (node.getClassName() !== undefined) {
        classNames += " " + node.getClassName();
    }

    let leadingContent = iconFactory ? iconFactory(node) : undefined;
    const titleContent = (titleFactory ? titleFactory(node) : undefined) || node.getName();

    if (typeof leadingContent === undefined && typeof node.getIcon() !== undefined) {
        leadingContent = <img src={node.getIcon()} alt="leadingContent" />;
    }

    let name = node.getName();
    let buttons: any[] = [];

    // allow customization of leading contents (icon) and contents
    const renderState = { leading: leadingContent, content: titleContent, name, buttons };
    layout.customizeTab(node, renderState);
    node._setRenderedName(renderState.name);

    const content = <div className={cm("flexlayout__border_button_content")}>{renderState.content}</div>;
    const leading = <div className={cm("flexlayout__border_button_leading")}>{renderState.leading}</div>;

    if (node.isEnableClose()) {
        const closeTitle = layout.i18nName(I18nLabel.Close_Tab);
        buttons.push(
            <div key="close" title={closeTitle} className={cm("flexlayout__border_button_trailing")} onMouseDown={onCloseMouseDown} onClick={onClose} onTouchStart={onCloseMouseDown}>
                {icons?.close}
            </div>
        );
    }

    return (
        <div ref={selfRef} style={{}} className={classNames} onMouseDown={onMouseDown} onTouchStart={onMouseDown}>
            {leading}
            {content}
            {buttons}
        </div>
    );
};
