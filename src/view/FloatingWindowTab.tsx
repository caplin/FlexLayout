import * as React from "react";
import TabNode from "../model/TabNode";
import Layout from "./Layout";

/** @hidden @internal */
export interface IFloatingWindowTabProps {
    layout: Layout;
    node: TabNode;
    factory: (node: TabNode) => React.ReactNode;
}

/** @hidden @internal */
export class FloatingWindowTab extends React.Component<IFloatingWindowTabProps, any> {

    constructor(props: IFloatingWindowTabProps) {
        super(props);
    }

    render() {
        const cm = this.props.layout.getClassName;
        const node = this.props.node;
        const child = this.props.factory(node);

        return (
            <div className={cm("flexlayout__floating_window_tab")}>
                {child}
            </div>
        );
    }
}
