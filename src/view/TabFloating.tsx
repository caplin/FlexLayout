import * as React from "react";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import { CLASSES } from "../Types";
import { ILayoutCallbacks } from "./Layout";
import { I18nLabel } from "../I18nLabel";

/** @hidden @internal */
export interface ITabFloatingProps {
    layout: ILayoutCallbacks;
    selected: boolean;
    node: TabNode;
}

/** @hidden @internal */
export const TabFloating = (props: ITabFloatingProps) => {
    const { layout, selected, node } = props;

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
        if (node.getWindow()) {
            node.getWindow()!.focus();
        }
    };

    const onClickDock = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        layout.doAction(Actions.unFloatTab(node.getId()));
    };

    const cm = layout.getClassName;

    const style: Record<string, any> = node._styleWithPosition({
        display: selected ? "flex" : "none",
    });

    const message = layout.i18nName(I18nLabel.Floating_Window_Message);
    const showMessage = layout.i18nName(I18nLabel.Floating_Window_Show_Window);
    const dockMessage = layout.i18nName(I18nLabel.Floating_Window_Dock_Window);

    return (
        <div className={cm(CLASSES.FLEXLAYOUT__TAB_FLOATING)} onMouseDown={onMouseDown} onTouchStart={onMouseDown} style={style}>
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
};
