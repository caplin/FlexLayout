import * as React from "react";
import { Fragment } from "react";
import { Actions } from "../model/Actions";
import { TabNode } from "../model/TabNode";
import { TabSetNode } from "../model/TabSetNode";
import { CLASSES } from "../Types";
import { ILayoutCallbacks } from "./Layout";
import { ErrorBoundary } from "./ErrorBoundary";
import { I18nLabel } from "../I18nLabel";
import { BorderNode } from "../model/BorderNode";
import { hideElement } from "./Utils";

/** @internal */
export interface ITabProps {
    layout: ILayoutCallbacks;
    selected: boolean;
    node: TabNode;
    factory: (node: TabNode) => React.ReactNode;
    path: string;
}

/** @internal */
export const Tab = (props: ITabProps) => {
    const { layout, selected, node, factory, path } = props;
    const [renderComponent, setRenderComponent] = React.useState<boolean>(!props.node.isEnableRenderOnDemand() || props.selected);

    React.useLayoutEffect(() => {
        if (!renderComponent && selected) {
            // load on demand
            // console.log("load on demand: " + node.getName());
            setRenderComponent(true);
        }
    });

    const onMouseDown = () => {
        const parent = node.getParent() as TabSetNode;
        if (parent.getType() === TabSetNode.TYPE) {
            if (!parent.isActive()) {
                layout.doAction(Actions.setActiveTabset(parent.getId()));
            }
        }
    };

    const cm = layout.getClassName;
    const useVisibility = node.getModel().isUseVisibility();

    const parentNode = node.getParent() as TabSetNode | BorderNode;
    const style: Record<string, any> = node._styleWithPosition();
    if (!selected) {
        hideElement(style, useVisibility);
    }

    if (parentNode instanceof TabSetNode) {
        if (node.getModel().getMaximizedTabset() !== undefined && !parentNode.isMaximized()) {
            hideElement(style, useVisibility);
        }
    }

    let child;
    if (renderComponent) {
        child = factory(node);
    }

    let className = cm(CLASSES.FLEXLAYOUT__TAB);
    if (parentNode instanceof BorderNode) {
        className += " " + cm(CLASSES.FLEXLAYOUT__TAB_BORDER);
        className += " " + cm(CLASSES.FLEXLAYOUT__TAB_BORDER_ + parentNode.getLocation().getName());
    }
    
    if (node.getContentClassName() !== undefined) {
        className += " " + node.getContentClassName();
    }

    return (
        <div
            className={className}
            data-layout-path={path}
            onMouseDown={onMouseDown}
            onTouchStart={onMouseDown}
            style={style}>
            <ErrorBoundary message={props.layout.i18nName(I18nLabel.Error_rendering_component)}>
                <Fragment>{child}</Fragment>
            </ErrorBoundary>
        </div>
    );
};


