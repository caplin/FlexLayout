import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { DragDrop } from "../../src/index";

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

    DragDrop.instance.addGlass(() => onHide(undefined));
    DragDrop.instance.setGlassCursorOverride("default");
    layoutDiv.appendChild(elm);

    const onHide = (item: string | undefined) => {
        DragDrop.instance.hideGlass();
        onSelect(item);
        layoutDiv.removeChild(elm);
        root.unmount();
        elm.removeEventListener("mousedown", onElementMouseDown);
        currentDocument.removeEventListener("mousedown", onDocMouseDown);
    };

    const onElementMouseDown = (event: Event) => {
        event.stopPropagation();
    };

    const onDocMouseDown = (event: Event) => {
        onHide(undefined);
    };

    elm.addEventListener("mousedown", onElementMouseDown);
    currentDocument.addEventListener("mousedown", onDocMouseDown);

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

    const onItemClick = (item: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
