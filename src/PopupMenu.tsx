import * as React from "react";
import * as ReactDOM from "react-dom";
import TabNode from "./model/TabNode";

/** @hidden @internal */
export interface IPopupMenuProps {
  element: Element;
  items: Array<{ index: number, node: TabNode, name: string }>;
  onHide: () => void;
  onSelect: (item: { index: number, node: TabNode, name: string }) => void;
  classNameMapper: (defaultClassName: string) => string;
}

/** @hidden @internal */
class PopupMenu extends React.Component<IPopupMenuProps, any> {

  public static show(triggerElement: Element,
    items: Array<{ index: number, node: TabNode, name: string }>,
    onSelect: (item: { index: number, node: TabNode, name: string }) => void,
    classNameMapper: (defaultClassName: string) => string) {

    const triggerRect = triggerElement.getBoundingClientRect();
    const docRect = document.body.getBoundingClientRect();

    const elm = document.createElement("div");
    elm.className = classNameMapper("flexlayout__popup_menu_container");
    elm.style.right = (docRect.right - triggerRect.right) + "px";
    elm.style.top = triggerRect.bottom + "px";
    document.body.appendChild(elm);

    const onHide = function () {
      ReactDOM.unmountComponentAtNode(elm);
      document.body.removeChild(elm);
    };

    ReactDOM.render(<PopupMenu element={elm} onSelect={onSelect} onHide={onHide} items={items} classNameMapper={classNameMapper} />, elm);
  }

  public items: Array<{ index: number, name: string }> = [];
  public hidden: boolean = true;
  public elm?: Element;


  constructor(props: IPopupMenuProps) {
    super(props);
    this.onDocMouseUp = this.onDocMouseUp.bind(this);
    this.hidden = false;
  }

  public componentDidMount() {
    document.addEventListener("mouseup", this.onDocMouseUp);
  }

  public componentWillUnmount() {
    document.removeEventListener("mouseup", this.onDocMouseUp);
  }

  public onDocMouseUp(event: Event) {
    setTimeout(() => {
      this.hide();
    }, 0);
  }

  public hide() {
    if (!this.hidden) {
      this.props.onHide();
      this.hidden = true;
    }
  }

  public onItemClick(item: { index: number, node: TabNode, name: string }, event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    this.props.onSelect(item);
    this.hide();
    event.stopPropagation();
  }

  public render() {
    const items = this.props.items.map(item => <div key={item.index} className={this.props.classNameMapper("flexlayout__popup_menu_item")}
      onClick={this.onItemClick.bind(this, item)}>{item.name}</div>);

    return <div className={this.props.classNameMapper("flexlayout__popup_menu")}>
      {items}
    </div>;
  }
}

/** @hidden @internal */
export default PopupMenu;
