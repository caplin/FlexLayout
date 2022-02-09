import * as React from "react";
import { Actions } from "../model/Actions";
import { TabNode } from "../model/TabNode";
import { TabSetNode } from "../model/TabSetNode";
import { CLASSES } from "../Types";
import { ILayoutCallbacks } from "./Layout";
import { I18nLabel } from "../I18nLabel";
import { hideElement } from "./Utils";
import { BorderNode } from "../model/BorderNode";

/** @internal */
export interface ITabFloatingProps {
    layout: ILayoutCallbacks;
    selected: boolean;
    node: TabNode;
    path: string;
}

/** @internal */
export const TabFloating = (props: ITabFloatingProps) => {
    const { layout, selected, node, path } = props;

    const showPopout = () => {
        if (node.getWindow()) {
            node.getWindow()!.focus();
        }
    }

    const dockPopout = () => {
        layout.doAction(Actions.unFloatTab(node.getId()));
    }

    const onMouseDown = () => {
        const parent = node.getParent() as TabSetNode;
        if (parent.getType() === TabSetNode.TYPE) {
            if (!parent.isActive()) {
                layout.doAction(Actions.setActiveTabset(parent.getId()));
            }
        }
    };

    const onClickFocus = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        showPopout();
    };

    const onClickDock = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        dockPopout();
    };

    const cm = layout.getClassName;


    const parentNode = node.getParent() as TabSetNode | BorderNode;
    const style: Record<string, any> = node._styleWithPosition();
    if (!selected) {
        hideElement(style, node.getModel().isUseVisibility());
    }

    if (parentNode instanceof TabSetNode) {
        if (node.getModel().getMaximizedTabset() !== undefined && !parentNode.isMaximized()) {
            hideElement(style, node.getModel().isUseVisibility());
        }
    }

    const message = layout.i18nName(I18nLabel.Floating_Window_Message);
    const showMessage = layout.i18nName(I18nLabel.Floating_Window_Show_Window);
    const dockMessage = layout.i18nName(I18nLabel.Floating_Window_Dock_Window);

    const customRenderCallback = layout.getOnRenderFloatingTabPlaceholder();
    if (customRenderCallback) {
        return (
            <div className={cm(CLASSES.FLEXLAYOUT__TAB_FLOATING)} onMouseDown={onMouseDown} onTouchStart={onMouseDown} style={style}>
                {customRenderCallback(dockPopout, showPopout)}
            </div>
        );
    } else {
        return (
            <div className={cm(CLASSES.FLEXLAYOUT__TAB_FLOATING)}
                data-layout-path={path}
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}
                style={style}>
                <div className={cm(CLASSES.FLEXLAYOUT__TAB_FLOATING_INNER)}>
                    <div>{message}</div>
                    <div>
                        <a href="#" onClick={onClickFocus}>
                            {showMessage}
                        </a>
                    </div>
                    <div>
                        <a href="#" onClick={onClickDock}>
                            {dockMessage}
                        </a>
                    </div>
                </div>
            </div>
        );
    }
};
