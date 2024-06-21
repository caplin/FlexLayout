import * as React from "react";
import { TabNode } from "../model/TabNode";
import { LayoutInternal } from "./Layout";
import { CLASSES } from "../Types";
import { getRenderStateEx } from "./Utils";

/** @internal */
export interface ITabButtonStampProps {
    node: TabNode;
    layout: LayoutInternal;
}

/** @internal */
export const TabButtonStamp = (props: ITabButtonStampProps) => {
    const { layout, node } = props;

    const cm = layout.getClassName;

    let classNames = cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_STAMP);

    const renderState = getRenderStateEx(layout, node);

    let content = renderState.content ? (
        <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_CONTENT)}>
            {renderState.content}
        </div>)
        : node.getNameForOverflowMenu();

    const leading = renderState.leading ? (
        <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_LEADING)}>
            {renderState.leading}
        </div>) : null;

    return (
        <div
            className={classNames}
            title={node.getHelpText()}
        >
            {leading}
            {content}
        </div>
    );
};
