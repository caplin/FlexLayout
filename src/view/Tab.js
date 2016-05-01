import React from "react";
import ReactDOM from "react-dom";

class Tab extends React.Component {

    constructor(props) {
        super(props);
        this.state = {renderComponent: props.selected};
    }

    componentDidMount() {
        //console.log("mount " + this.props.node.getName());
    }

    componentWillUnmount() {
        //console.log("unmount " + this.props.node.getName());
    }

    componentWillReceiveProps(newProps) {
        if (!this.state.renderComponent && newProps.selected) {
            // load on demand
            //console.log("load on demand: " + this.props.node.getName());
            this.setState({renderComponent: true});
        }
    }

    render() {
        let node = this.props.node;
        let style = node._styleWithPosition({
            display: this.props.selected ? "block" : "none"
        });

        if (this.props.node.getParent().isMaximized()) {
            style.zIndex = 100;
        }

        let child = null;
        if (this.state.renderComponent) {
            child = this.props.factory(node);
        }

        return <div className="flexlayout__tab" style={style}>{child}</div>;
    }
}

export default Tab;