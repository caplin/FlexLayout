import React from "react";
import ReactDOM from "react-dom";
import Rect from "../Rect.js";
import PopupMenu from "../PopupMenu.js";
import Actions from "../model/Actions.js";

class TabButton extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {editing:false};
		this.onEndEdit = this.onEndEdit.bind(this);
	}

	onMouseDown(event)
	{
		this.props.layout.dragStart(event, "Move: " + this.props.node.getName(), this.props.node,this.props.node.isEnableDrag(), this.onClick.bind(this), this.onDoubleClick.bind(this));
	}

	onClick(event)
	{
		var node = this.props.node;
		this.props.layout.doAction(Actions.selectTab(node.getParent(), this.props.pos));
	}

	onDoubleClick(event)
	{
		if (this.props.node.isEnableRename())
		{
			this.setState({editing: true});
			document.body.addEventListener("mousedown", this.onEndEdit);
			document.body.addEventListener("touchstart", this.onEndEdit);
		}
	}

	onEndEdit(event)
	{
		if (event.target != this.refs.contents)
		{
			this.setState({editing:false});
			document.body.removeEventListener("mousedown", this.onEndEdit);
			document.body.removeEventListener("touchstart", this.onEndEdit);
		}
	}

	onClose(event)
	{
		var node = this.props.node;
		this.props.layout.doAction(Actions.deleteTab(node));
	}

	onCloseMouseDown(event)
	{
		event.stopPropagation();
	}

	componentDidMount()
	{
		this.updateRect();
	}

	componentDidUpdate()
	{
		this.updateRect();
		if (this.state.editing)
		{
			this.refs.contents.select();
		}
	}

	updateRect()
	{
		// record position of tab in node
		var clientRect = ReactDOM.findDOMNode(this.props.layout).getBoundingClientRect();
		var r = this.refs.self.getBoundingClientRect();
		this.props.node.setTabRect(new Rect(r.left - clientRect.left, r.top - clientRect.top, r.width, r.height));
		this.contentWidth = this.refs.contents.getBoundingClientRect().width;
	}

	onTextBoxMouseDown(event)
	{
		//console.log("onTextBoxMouseDown");
		event.stopPropagation();
	}

	onTextBoxKeyPress(event)
	{
		//console.log(event, event.keyCode);
		if (event.keyCode == 27) // esc
		{
			this.setState({editing:false});
		}
		else if (event.keyCode == 13) // enter
		{
			var node = this.props.node;
			this.props.layout.doAction(Actions.renameTab(node, event.target.value));
			this.setState({editing:false});
		}
	}

	render()
	{
		var classNames = "flexlayout__tab_button" ;
		var node = this.props.node;

		if (this.props.selected)
		{
			classNames += " flexlayout__tab_button--selected";
		}
		else
		{
			classNames += " flexlayout__tab_button--unselected";
		}

		if (this.props.node.getClassName() != null)
		{
			classNames += " " + this.props.node.getClassName();
		}

		var leadingContent = null;

		if (node.getIcon() != null)
		{
			leadingContent = <img src={node.getIcon()}/>;
		}

		// allow customization of leading contents (icon) and contents
		var renderState = {leading:leadingContent, content:node.getName()};
		this.props.layout.customizeTab(node, renderState);

		var content = <div ref="contents" className="flexlayout__tab_button_content">{renderState.content}</div>;
		var leading = <div className={"flexlayout__tab_button_leading"}>{renderState.leading}</div>;

		if (this.state.editing)
		{
			var contentStyle = {width: this.contentWidth + "px"};
			content = <input style={contentStyle}
							 ref="contents"
							 className="flexlayout__tab_button_textbox"
							 type="text"
							 autoFocus
							 defaultValue={node.getName()}
							 onKeyDown={this.onTextBoxKeyPress.bind(this)}
							 onMouseDown={this.onTextBoxMouseDown.bind(this)}
							 onTouchStart={this.onTextBoxMouseDown.bind(this)}
				/>;
		}

		var closeButton = null;
		if (this.props.node.isEnableClose())
		{
			closeButton = <div className={"flexlayout__tab_button_trailing"}
							  onMouseDown={this.onCloseMouseDown.bind(this)}
							  onClick={this.onClose.bind(this)}
							  onTouchStart={this.onCloseMouseDown.bind(this)}
				/>;
		}

		return <div ref="self"
					style={{visibility:this.props.show?"visible":"hidden",
							height:this.props.height}}
					className={classNames}
					onMouseDown={this.onMouseDown.bind(this)}
					onTouchStart={this.onMouseDown.bind(this)}>
					{leading}
					{content}
					{closeButton}
				</div>;
	}
}

export default TabButton;