import * as React from "react";
import { I18nLabel } from "../I18nLabel";
import { Actions } from "../model/Actions";
import { TabNode } from "../model/TabNode";
import { IIcons, LayoutInternal } from "./Layout";
import { ICloseType } from "../model/ICloseType";
import { CLASSES } from "../Types";
import { getRenderStateEx, isAuxMouseEvent } from "./Utils";

/** @internal */
export interface IBorderButtonProps {
    layout: LayoutInternal;
    node: TabNode;
    selected: boolean;
    border: string;
    icons: IIcons;
    path: string;
}

/** @internal */
export const BorderButton = (props: IBorderButtonProps) => {
    const { layout, node, selected, border, icons, path } = props;
    const selfRef = React.useRef<HTMLDivElement | null>(null);
    const contentRef = React.useRef<HTMLInputElement | null>(null);

    const onDragStart = (event: React.DragEvent<HTMLElement>) => {
        if (node.isEnableDrag()) {
            event.stopPropagation();
            layout.setDragNode(event.nativeEvent, node as TabNode);
        } else {
            event.preventDefault();
        }
    };

    const onDragEnd = (event: React.DragEvent<HTMLElement>) => {
        event.stopPropagation();
        layout.clearDragMain();
    };

    const onAuxMouseClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (isAuxMouseEvent(event)) {
            layout.auxMouseClick(node, event);
        } 
    };

    const onContextMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        layout.showContextMenu(node, event);
    };

    const onClick = () => {
        layout.doAction(Actions.selectTab(node.getId()));
    };

    // const onDoubleClick = (event: Event) => {
    //     // if (node.isEnableRename()) {
    //     //     onRename();
    //     // }
    // };

    // const onRename = () => {
    //     layout.setEditingTab(node);
    //     layout.getCurrentDocument()!.body.addEventListener("pointerdown", onEndEdit);
    // };

    const onEndEdit = (event: Event) => {
        if (event.target !== contentRef.current!) {
            layout.getCurrentDocument()!.body.removeEventListener("pointerdown", onEndEdit);
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

    const onClose = (event: React.MouseEvent<HTMLElement>) => {
        if (isClosable()) {
            layout.doAction(Actions.deleteTab(node.getId()));
        } else {
            onClick();
        }
    };

    const onClosePointerDown = (event: React.PointerEvent<HTMLElement>) => {
        event.stopPropagation();
    };

    React.useLayoutEffect(() => {
        node.setTabRect(layout.getBoundingClientRect(selfRef.current!));
        if (layout.getEditingTab() === node) {
            (contentRef.current! as HTMLInputElement).select();
        }
    });

    const onTextBoxPointerDown = (event: React.PointerEvent<HTMLInputElement>) => {
        event.stopPropagation();
    };

    const onTextBoxKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.code === 'Escape') {
            // esc
            layout.setEditingTab(undefined);
        } else if (event.code === 'Enter') {
            // enter
            layout.setEditingTab(undefined);
            layout.doAction(Actions.renameTab(node.getId(), (event.target as HTMLInputElement).value));
        }
    };

    const cm = layout.getClassName;
    let classNames = cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON_ + border);

    if (selected) {
        classNames += " " + cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON__SELECTED);
    } else {
        classNames += " " + cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON__UNSELECTED);
    }

    if (node.getClassName() !== undefined) {
        classNames += " " + node.getClassName();
    }

    let iconAngle = 0;
    if (node.getModel().isEnableRotateBorderIcons() === false) {
        if (border === "left") {
            iconAngle = 90;
        } else if (border === "right") {
            iconAngle = -90;
        }
    }

    const renderState = getRenderStateEx(layout, node, iconAngle);

    let content = renderState.content ? (
        <div className={cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON_CONTENT)}>
            {renderState.content}
        </div>) : null;

    const leading = renderState.leading ? (
        <div className={cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON_LEADING)}>
            {renderState.leading}
        </div>) : null;

    if (layout.getEditingTab() === node) {
        content = (
            <input
                ref={contentRef}
                className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_TEXTBOX)}
                data-layout-path={path + "/textbox"}
                type="text"
                autoFocus={true}
                defaultValue={node.getName()}
                onKeyDown={onTextBoxKeyPress}
                onPointerDown={onTextBoxPointerDown}
            />
        );
    }

    if (node.isEnableClose()) {
        const closeTitle = layout.i18nName(I18nLabel.Close_Tab);
        renderState.buttons.push(
            <div
                key="close"
                data-layout-path={path + "/button/close"}
                title={closeTitle}
                className={cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON_TRAILING)}
                onPointerDown={onClosePointerDown}
                onClick={onClose}>
                {(typeof icons.close === "function") ? icons.close(node) : icons.close}
            </div>
        );
    }

    return (
        <div
            ref={selfRef}
            data-layout-path={path}
            className={classNames}
            onClick={onClick}
            onAuxClick={onAuxMouseClick}
            onContextMenu={onContextMenu}
            title={node.getHelpText()}
            draggable={true}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            {leading}
            {content}
            {renderState.buttons}
        </div>
    );
};
