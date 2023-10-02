import * as React from "react";
import { TabNode } from "../model/TabNode";
import { IconFactory, ILayoutCallbacks, ITitleObject, TitleFactory } from "./Layout";

/** @internal */
export function getRenderStateEx(
    layout: ILayoutCallbacks,
    node: TabNode,
    iconFactory?: IconFactory,
    titleFactory?: TitleFactory,
    iconAngle?: number
) {
    let leadingContent = iconFactory ? iconFactory(node) : undefined;
    let titleContent: React.ReactNode = node.getName();
    let name = node.getName();
    if (iconAngle === undefined) {
        iconAngle = 0;
    }

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

    if (leadingContent === undefined && node.getIcon() !== undefined) {
        if (iconAngle !== 0) {
             leadingContent = <img style={{ width: "1em", height: "1em", transform: "rotate(" + iconAngle + "deg)" }} src={node.getIcon()} alt="leadingContent" />;
        } else {
            leadingContent = <img style={{ width: "1em", height: "1em" }} src={node.getIcon()} alt="leadingContent" />;  
        }
    }

    let buttons: any[] = [];

    // allow customization of leading contents (icon) and contents
    const renderState = { leading: leadingContent, content: titleContent, name, buttons };
    layout.customizeTab(node, renderState);

    node._setRenderedName(renderState.name);

    return renderState;

}

/** @internal */
export function hideElement(style: Record<string, any>, useVisibility: ConstrainBoolean) {
    if (useVisibility) {
        style.visibility = "hidden";
    } else {
        style.display = "none";
    }
}


/** @internal */
export function isAuxMouseEvent(event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) {
    let auxEvent = false;
    if (event.nativeEvent instanceof MouseEvent) {
        if (event.nativeEvent.button !== 0 || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
            auxEvent = true;
        }
    }
    return auxEvent;
}

