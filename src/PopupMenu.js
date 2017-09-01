import React from "react";
import ReactDOM from "react-dom";

class PopupMenu extends React.Component {

    constructor(props) {
        super(props);
        this.onDocMouseUp = this.onDocMouseUp.bind(this);
        this.hidden = false;
    }

    static show(triggerElement, items, onSelect) {
        const triggerRect = triggerElement.getBoundingClientRect();
        const docRect = document.body.getBoundingClientRect();

        const elm = document.createElement("div");
        elm.className = "flexlayout__popup_menu_container";
        elm.style.right = (docRect.right - triggerRect.right) + "px";
        elm.style.top = triggerRect.bottom + "px";
        document.body.appendChild(elm);

        const onHide = function () {
            ReactDOM.unmountComponentAtNode(elm);
            document.body.removeChild(elm);
        };

        ReactDOM.render(<PopupMenu element={elm} onSelect={onSelect} onHide={onHide} items={items}/>, elm);
        this.elm = elm;
    }

    componentDidMount() {
        document.addEventListener("mouseup", this.onDocMouseUp);
    }

    componentWillUnmount() {
        document.removeEventListener("mouseup", this.onDocMouseUp);
    }

    onDocMouseUp(event) {
        setInterval(function () {
            this.hide();
        }.bind(this), 0);
    }

    hide() {
        if (!this.hidden) {
            this.props.onHide();
            this.hidden = true;
        }
    }

    onItemClick(item, event) {
        this.props.onSelect(item);
        this.hide();
        event.stopPropagation();
    }

    render() {
        const items = this.props.items.map(item => <div key={item.index} className="flexlayout__popup_menu_item"
                                                        onClick={this.onItemClick.bind(this, item)}>{item.name}</div>);

        return <div className="popup_menu">
            {items}
        </div>;
    }
}

export default PopupMenu;
