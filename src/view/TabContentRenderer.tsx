import * as React from "react";
import { Rect } from "../model/Rect";
import { ErrorBoundary } from "./ErrorBoundary";
import { I18nLabel } from "./I18nLabel";
import { LayoutController, LayoutInternal } from "./layout/LayoutInternal";
import { TabNode } from "../model/TabNode";
import { CLASSES } from "./CSSClassNames";

export interface ITabContentRenderProps {  
    controller: LayoutController,
    tabNode: TabNode,
    rect: Rect;
    windowId: string;
    visible: boolean;
    fullRedrawRevision: number;
    parentRedrawRevision: number;
}

export const TabContentRenderer = React.memo(({ controller, tabNode }: ITabContentRenderProps) => {

    TabContentRenderer.displayName = 'TabContentRenderer'; // name in react dev tools

    let content;
    if (tabNode.getComponent()) {
        content = controller.getFactory()(tabNode);
    } else if (tabNode.getSubLayoutId()) {
        content = <div className={controller.getClassName(CLASSES.FLEXLAYOUT__TAB_LAYOUT_CONTAINER)}>
                <LayoutInternal {...controller.getProps()} layoutId={tabNode.getSubLayoutId()} mainLayoutController={controller.getMainController()} />;
            </div>;
    }
    return (
        <ErrorBoundary
            message={controller.i18nName(I18nLabel.Error_rendering_component)}
            retryText={controller.i18nName(I18nLabel.Error_rendering_component_retry)}>
            {content}
        </ErrorBoundary>);
}, arePropsEqual);

// only re-render if visible && (fullRedrawRevision or parentRedrawRevision changed)
function arePropsEqual(prevProps: ITabContentRenderProps, nextProps: ITabContentRenderProps) {
    const reRender = nextProps.visible && 
        (
            prevProps.windowId !== nextProps.windowId ||
            prevProps.fullRedrawRevision !== nextProps.fullRedrawRevision ||
            prevProps.parentRedrawRevision !== nextProps.parentRedrawRevision ||
            nextProps.tabNode.getSubLayoutId() !== undefined
        );
    return !reRender;
}

