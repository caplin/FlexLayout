import * as React from "react";
import * as ReactDOM from "react-dom";
import TabNode from "./model/TabNode";

/** @hidden @internal */
export function showPopup(
    layoutDiv: HTMLDivElement,
    triggerElement: Element,
    items: { index: number; node: TabNode }[],
    onSelect: (item: { index: number; node: TabNode }) => void,
    classNameMapper: (defaultClassName: string) => string
) {
    const currentDocument = triggerElement.ownerDocument;
    const triggerRect = triggerElement.getBoundingClientRect();
    const layoutRect = layoutDiv.getBoundingClientRect();

    const elm = currentDocument.createElement("div");
    elm.className = classNameMapper("flexlayout__popup_menu_container");
    if (triggerRect.left < layoutRect.left + layoutRect.width / 2) {
        elm.style.left = triggerRect.left - layoutRect.left + "px";
    } else {
        elm.style.right = layoutRect.right - triggerRect.right + "px";
    }

    if (triggerRect.top < layoutRect.top + layoutRect.height / 2) {
        elm.style.top = triggerRect.top - layoutRect.top + "px";
    } else {
        elm.style.bottom = layoutRect.bottom - triggerRect.bottom + "px";
    }
    layoutDiv.appendChild(elm);

    const onHide = () => {
        layoutDiv.removeChild(elm);
        ReactDOM.unmountComponentAtNode(elm);
        elm.removeEventListener("mouseup", onElementMouseUp);
        currentDocument.removeEventListener("mouseup", onDocMouseUp);
    };

    const onElementMouseUp = (event: Event) => {
        event.stopPropagation();
    };

    const onDocMouseUp = (event: Event) => {
        onHide();
    };

    elm.addEventListener("mouseup", onElementMouseUp);
    currentDocument.addEventListener("mouseup", onDocMouseUp);

    ReactDOM.render(<PopupMenu currentDocument={currentDocument} onSelect={onSelect} onHide={onHide} items={items} classNameMapper={classNameMapper} />, elm);
}

/** @hidden @internal */
interface IPopupMenuProps {
    items: { index: number; node: TabNode }[];
    currentDocument: Document;
    onHide: () => void;
    onSelect: (item: { index: number; node: TabNode }) => void;
    classNameMapper: (defaultClassName: string) => string;
}

/** @hidden @internal */
const PopupMenu = (props: IPopupMenuProps) => {
    const { items, onHide, onSelect, classNameMapper } = props;

    const onItemClick = (item: { index: number; node: TabNode }, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        onSelect(item);
        onHide();
        event.stopPropagation();
    };

    const itemElements = items.map((item) => (
        <div key={item.index} className={classNameMapper("flexlayout__popup_menu_item")} onClick={(event) => onItemClick(item, event)}>
            {item.node._getRenderedName()}
        </div>
    ));

    return <div className={classNameMapper("flexlayout__popup_menu")}>{itemElements}</div>;
};
