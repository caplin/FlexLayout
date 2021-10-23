import * as React from "react";
import * as ReactDOM from "react-dom";

/** @hidden @internal */
export function showPopup(
    layoutDiv: HTMLDivElement,
    x: number, y: number,
    items: string[],
    onSelect: (item: string | undefined) => void,
) {
    const currentDocument = layoutDiv.ownerDocument;
    const layoutRect = layoutDiv.getBoundingClientRect();

    const elm = currentDocument.createElement("div");
    elm.className = "popup_menu_container";
    elm.style.left = x - layoutRect.left - 5 + "px";
    elm.style.top = y - layoutRect.top - 5 + "px";
    layoutDiv.appendChild(elm);

    const onHide = (item: string | undefined) => {
        onSelect(item);
        layoutDiv.removeChild(elm);
        ReactDOM.unmountComponentAtNode(elm);
        elm.removeEventListener("mouseup", onElementMouseUp);
        currentDocument.removeEventListener("mouseup", onDocMouseUp);
    };

    const onElementMouseUp = (event: Event) => {
        event.stopPropagation();
    };

    const onDocMouseUp = (event: Event) => {
        onHide(undefined);
    };

    elm.addEventListener("mouseup", onElementMouseUp);
    currentDocument.addEventListener("mouseup", onDocMouseUp);

    ReactDOM.render(<PopupMenu currentDocument={currentDocument} onHide={onHide} items={items} />, elm);
}

/** @hidden @internal */
interface IPopupMenuProps {
    items: string[];
    currentDocument: Document;
    onHide: (item: string | undefined) => void;
}

/** @hidden @internal */
const PopupMenu = (props: IPopupMenuProps) => {
    const { items, onHide } = props;

    const onItemClick = (item: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        onHide(item);
        event.stopPropagation();
    };

    const itemElements = items.map((item) => (
        <div key={item} className="popup_menu_item" onClick={(event) => onItemClick(item, event)}>
            {item}
        </div>
    ));

    return <div dir="ltr" className="popup_menu">{itemElements}</div>;
};
