import * as React from "react";
import TabNode from "../model/TabNode";
import {ILayoutCallbacks} from "./Layout";
import {ErrorBoundary} from "./ErrorBoundary";
import {I18nLabel} from "../I18nLabel";
import {Fragment} from "react";

/** @hidden @internal */
export interface IFloatingWindowTabProps {
    layout: ILayoutCallbacks;
    node: TabNode;
    factory: (node: TabNode) => React.ReactNode;
}

/** @hidden @internal */
export const FloatingWindowTab = (props: IFloatingWindowTabProps) => {
    const {layout, node, factory} = props;
    const cm = layout.getClassName;
    const child = factory(node);

    return (
        <div className={cm("flexlayout__floating_window_tab")}>
            <ErrorBoundary message={props.layout.i18nName(I18nLabel.Error_rendering_component)}>
                <Fragment>
                    {child}
                </Fragment>
            </ErrorBoundary>
        </div>
    );
};
