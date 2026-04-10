import * as React from "react";
import { I18nLabel } from "./I18nLabel";
import { Actions } from "../model/Actions";
import { TabNode } from "../model/TabNode";
import { IIcons } from "../view/layout/LayoutTypes";
import { LayoutController } from "../view/layout/LayoutInternal";
import { ICloseType } from "../model/ICloseType";
import { CLASSES } from "./CSSClassNames";
import { getRenderStateEx, isAuxMouseEvent } from "./Utils";

/** @internal */
export interface IBorderButtonProps {
    controller: LayoutController;
    tabNode: TabNode;
    selected: boolean;
    border: string;
    icons: IIcons;
    path: string;
}

/** @internal */
export const BorderButton = (props: IBorderButtonProps) => {
    const { controller, tabNode, selected, border, icons, path } = props;
    const selfRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLInputElement>(null);

    const onDragStart = (event: React.DragEvent<HTMLElement>) => {
        if (tabNode.isEnableDrag()) {
            event.stopPropagation();
            controller.getDragDropManager().setDragNode(event.nativeEvent, tabNode as TabNode);
        } else {
            event.preventDefault();
        }
    };

    const onDragEnd = (event: React.DragEvent<HTMLElement>) => {
        event.stopPropagation();
        controller.getDragDropManager().clearDragMain();
    };

    const onAuxMouseClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (isAuxMouseEvent(event)) {
            controller.auxMouseClick(tabNode, event);
        } 
    };

    const onContextMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        controller.showContextMenu(tabNode, event);
    };

    const onClick = () => {
        controller.doAction(Actions.selectTab(tabNode.getId()));
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
            controller.getCurrentDocument()!.body.removeEventListener("pointerdown", onEndEdit);
            controller.setEditingTab(undefined);
        }
    };

    const isClosable = () => {
        const closeType = tabNode.getCloseType();
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
            controller.doAction(Actions.deleteTab(tabNode.getId()));
            event.stopPropagation();
        }
    };

    const onClosePointerDown = (event: React.PointerEvent<HTMLElement>) => {
        event.stopPropagation();
    };

    React.useLayoutEffect(() => {
        tabNode.setTabRect(controller.getBoundingClientRect(selfRef.current!));
        if (controller.getEditingTab() === tabNode) {
            (contentRef.current! as HTMLInputElement).select();
        }
    });

    const onTextBoxPointerDown = (event: React.PointerEvent<HTMLInputElement>) => {
        event.stopPropagation();
    };

    const onTextBoxKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.code === 'Escape') {
            // esc
            controller.setEditingTab(undefined);
        } else if (event.code === 'Enter' || event.code === 'NumpadEnter') {
            // enter
            controller.setEditingTab(undefined);
            controller.doAction(Actions.renameTab(tabNode.getId(), (event.target as HTMLInputElement).value));
        }
    };

    const cm = controller.getClassName;
    let classNames = cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON_ + border);

    if (selected) {
        classNames += " " + cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON__SELECTED);
    } else {
        classNames += " " + cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON__UNSELECTED);
    }

    if (tabNode.getClassName() !== undefined) {
        classNames += " " + tabNode.getClassName();
    }

    let iconAngle = 0;
    if (tabNode.getModel().isEnableRotateBorderIcons() === false) {
        if (border === "left") {
            iconAngle = 90;
        } else if (border === "right") {
            iconAngle = -90;
        }
    }

    const renderState = getRenderStateEx(controller, tabNode, iconAngle);

    let content = renderState.content ? (
        <div className={cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON_CONTENT)}>
            {renderState.content}
        </div>) : null;

    const leading = renderState.leading ? (
        <div className={cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON_LEADING)}>
            {renderState.leading}
        </div>) : null;

    if (controller.getEditingTab() === tabNode) {
        content = (
            <input
                ref={contentRef}
                className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_TEXTBOX)}
                data-layout-path={path + "/textbox"}
                type="text"
                autoFocus={true}
                defaultValue={tabNode.getName()}
                onKeyDown={onTextBoxKeyPress}
                onPointerDown={onTextBoxPointerDown}
            />
        );
    }

    if (tabNode.isCloseable()) {
        const closeTitle = controller.i18nName(I18nLabel.Close_Tab);
        renderState.buttons.push(
            <div
                key="close"
                data-layout-path={path + "/button/close"}
                title={closeTitle}
                className={cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON_TRAILING)}
                onPointerDown={onClosePointerDown}
                onClick={onClose}>
                {(typeof icons.close === "function") ? icons.close(tabNode) : icons.close}
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
            title={tabNode.getHelpText()}
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
