import React from "react";
import ReactDOM from "react-dom";

class Tab extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {renderComponent:props.selected};
	}

	componentDidMount()
	{
		console.log("mount " + this.props.node.name);
	}

	componentWillUnmount()
	{
		console.log("unmount " + this.props.node.name);
	}

	componentWillReceiveProps(newProps)
	{
		if (!this.state.renderComponent && newProps.selected)
		{
			// load on demand
			console.log("load on demand: " + this.props.node.name);
			this.setState({renderComponent:true});
		}
	}

    render()
    {
        var node = this.props.node;
        var style = node.styleWithPosition({
            	display: this.props.selected ? "block" : "none"
            });

		if (this.props.node.parent.maximized)
		{
			style.zIndex = 100;
		}

		var child = null;
		if (this.state.renderComponent )
		{
			child = this.props.factory(node);
		}

        return <div className="flexlayout__tab" style={style}>{child}</div>;
    }
}

export default Tab;