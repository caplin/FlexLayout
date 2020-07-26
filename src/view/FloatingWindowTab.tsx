import * as React from "react";
import TabNode from "../model/TabNode";
import {ILayoutCallbacks} from "./Layout";

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
            {child}
        </div>
    );
};
