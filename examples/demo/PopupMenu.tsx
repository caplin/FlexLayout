import * as React from "react";
import * as ReactDOM from "react-dom";
import { DragDrop } from "../../src";

/** @hidden @internal */
export function showPopup(
    title: string,
    layoutDiv: HTMLDivElement,
    x: number, y: number,
    items: string[],
    onSelect: (item: string | undefined) => void,
) {
    const currentDocument = layoutDiv.ownerDocument;
    const layoutRect = layoutDiv.getBoundingClientRect();

    const elm = currentDocument.createElement("div");
    elm.className = "popup_menu_container";
    elm.style.left = x - layoutRect.left + "px";
    elm.style.top = y - layoutRect.top + "px";
    DragDrop.instance.addGlass(() => onHide(undefined));
    layoutDiv.appendChild(elm);

    const onHide = (item: string | undefined) => {
        DragDrop.instance.hideGlass();
        onSelect(item);
        layoutDiv.removeChild(elm);
        ReactDOM.unmountComponentAtNode(elm);
        currentDocument.removeEventListener("mousedown", onDocMouseDown);
    };

    const onDocMouseDown = (event: Event) => {
        onHide(undefined);
    };

    currentDocument.addEventListener("mousedown", onDocMouseDown);

    ReactDOM.render(<PopupMenu
        currentDocument={currentDocument}
        onHide={onHide}
        title={title}
        items={items} />,
        elm);
}

/** @hidden @internal */
interface IPopupMenuProps {
    title: string;
    items: string[];
    currentDocument: Document;
    onHide: (item: string | undefined) => void;
}

/** @hidden @internal */
const PopupMenu = (props: IPopupMenuProps) => {
    const { title, items, onHide } = props;

    const onItemClick = (item: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        onHide(item);
        event.stopPropagation();
    };

    const itemElements = items.map((item) => (
        <div key={item} className="popup_menu_item" onClick={(event) => onItemClick(item, event)}>
            {item}
        </div>
    ));

    return (
        <div dir="ltr" className="popup_menu">
            <div className="popup_menu_title">{title}</div>
            {itemElements}
        </div>);
};
