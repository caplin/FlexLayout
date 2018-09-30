import * as React from "react";
import TabSetNode from "../model/TabSetNode";
import TabNode from "../model/TabNode";
import Actions from "../model/Actions";
import Layout from "./Layout";
import { JSMap } from "../Types";

/** @hidden @internal */
export interface ITabProps {
    layout: Layout,
    selected: boolean,
    node: TabNode,
    factory: (node:TabNode) => React.ReactNode
}

/** @hidden @internal */
export class Tab extends React.Component<ITabProps, any> {

    constructor(props:ITabProps) {
        super(props);
        this.state = {renderComponent: !props.node.isEnableRenderOnDemand() || props.selected};
    }

    componentDidMount() {
        //console.log("mount " + this.props.node.getName());
    }

    componentWillUnmount() {
        //console.log("unmount " + this.props.node.getName());
    }

    componentWillReceiveProps(newProps: ITabProps) {
        if (!this.state.renderComponent && newProps.selected) {
            // load on demand
            //console.log("load on demand: " + this.props.node.getName());
            this.setState({renderComponent: true});
        }
    }

    onMouseDown(event:React.MouseEvent<HTMLDivElement>) {
        const parent = this.props.node.getParent() as TabSetNode;
        if (parent.getType() === TabSetNode.TYPE) {
            if (!parent.isActive()) {
                this.props.layout.doAction(Actions.setActiveTabset(parent.getId()));
            }
        }
    }

    render() {
        let cm = this.props.layout.getClassName;

        const node = this.props.node;
        const parentNode = node.getParent() as TabSetNode;
        const style:JSMap<any> = node._styleWithPosition({
            display: this.props.selected ? "block" : "none"
        });

        if (parentNode.isMaximized()) {
            style.zIndex = 100;
        }

        let child = undefined;
        if (this.state.renderComponent) {
            child = this.props.factory(node);
        }

        return <div className={cm("flexlayout__tab")}
                    onMouseDown={this.onMouseDown.bind(this)}
                    onTouchStart={this.onMouseDown.bind(this)}
                    style={style}>{child}
        </div>;
    }
}

// export default Tab;
