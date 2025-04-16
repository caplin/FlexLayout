import * as React from "react";
import * as ReactDOM from "react-dom/client";

/** @hidden @internal */
export function showPopup(
    title: string,
    layoutDiv: HTMLElement,
    x: number, y: number,
    items: string[],
    onSelect: (item: string | undefined) => void,
) {
    const currentDocument = layoutDiv.ownerDocument;
    const layoutRect = layoutDiv.getBoundingClientRect();

    const elm = currentDocument.createElement("div");
    elm.className = "popup_menu_container";

    if (x < layoutRect.left + layoutRect.width / 2) {
        elm.style.left = x - layoutRect.left + "px";
    } else {
        elm.style.right = layoutRect.right - x + "px";
    }

    if (y < layoutRect.top + layoutRect.height / 2) {
        elm.style.top = y - layoutRect.top + "px";
    } else {
        elm.style.bottom = layoutRect.bottom - y + "px";
    }

    layoutDiv.appendChild(elm);

    const onHide = (item: string | undefined) => {
        onSelect(item);
        layoutDiv.removeChild(elm);
        root.unmount();
        elm.removeEventListener("pointerdown", onElementPointerDown);
        currentDocument.removeEventListener("pointerdown", onDocPointerDown);
    };

    const onElementPointerDown = (event: Event) => {
        event.stopPropagation();
    };

    const onDocPointerDown = (event: Event) => {
        onHide(undefined);
    };

    elm.addEventListener("pointerdown", onElementPointerDown);
    currentDocument.addEventListener("pointerdown", onDocPointerDown);

    const root = ReactDOM.createRoot(elm);
    root.render(<PopupMenu
        currentDocument={currentDocument}
        onHide={onHide}
        title={title}
        items={items} />);
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

    const onItemClick = (item: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        onHide(item);
        event.stopPropagation();
    };

    const itemElements = items.map((item) => (
        <div key={item}
            className="popup_menu_item"
            onClick={(event) => onItemClick(item, event)}>
            {item}
        </div>
    ));

    return (
        <div className="popup_menu">
            <div className="popup_menu_title">{title}</div>
            {itemElements}
        </div>);
};
