import * as React from "react";
import * as ReactDOM from "react-dom";
import TabNode from "./model/TabNode";

export function showPopup(triggerElement: Element,
                          items: { index: number, node: TabNode, name: string }[],
                          onSelect: (item: { index: number, node: TabNode, name: string }) => void,
                          classNameMapper: (defaultClassName: string) => string) {

    const triggerRect = triggerElement.getBoundingClientRect();
    const currentDocument = triggerElement.ownerDocument;
    const currentWindow = currentDocument.defaultView;
    let windowWidth, windowHeight;
    if (currentWindow) {
      windowWidth = currentWindow.innerWidth;
      windowHeight = currentWindow.innerHeight;
    } else {
      const docRect = currentDocument.body.getBoundingClientRect();
      windowWidth = docRect.right;
      windowHeight = docRect.bottom;
    }

    const elm = currentDocument.createElement("div");
    elm.className = classNameMapper("flexlayout__popup_menu_container");
    if (triggerRect.left < windowWidth / 2) {
        elm.style.left = (triggerRect.left) + "px";
    } else {
        elm.style.right = (windowWidth - triggerRect.right) + "px";
    }
    if (triggerRect.top < windowHeight / 2) {
        elm.style.top = (triggerRect.top) + "px";
    } else {
        elm.style.bottom = (windowHeight - triggerRect.bottom) + "px";
    }
    currentDocument.body.appendChild(elm);

    const onHide = () => {
        ReactDOM.unmountComponentAtNode(elm);
        currentDocument.body.removeChild(elm);
    };

    ReactDOM.render(<PopupMenu currentDocument={currentDocument} onSelect={onSelect} onHide={onHide} items={items}
                               classNameMapper={classNameMapper}/>, elm);
}

/** @hidden @internal */
interface IPopupMenuProps {
    items: { index: number, node: TabNode, name: string }[];
    currentDocument: Document;
    onHide: () => void;
    onSelect: (item: { index: number, node: TabNode, name: string }) => void;
    classNameMapper: (defaultClassName: string) => string;
}

/** @hidden @internal */
const PopupMenu = (props: IPopupMenuProps) => {
    const {currentDocument, items, onHide, onSelect, classNameMapper} = props;
    const hidden = React.useRef<boolean>(false);

    React.useEffect(() => {
        currentDocument.addEventListener("mouseup", onDocMouseUp);
        return () => {
            currentDocument.removeEventListener("mouseup", onDocMouseUp);
        };
    }, []);

    const onDocMouseUp = (event: Event) => {
        setTimeout(() => {
            hide();
        }, 0);
    };

    const hide = () => {
        if (!hidden.current) {
            onHide();
            hidden.current = true;
        }
    };

    const onItemClick = (item: { index: number, node: TabNode, name: string }, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        onSelect(item);
        hide();
        event.stopPropagation();
    };

    const itemElements = items.map(item => <div key={item.index}
                                                className={classNameMapper("flexlayout__popup_menu_item")}
                                                onClick={(event) => onItemClick(item, event)}>{item.name}</div>);

    return <div className={classNameMapper("flexlayout__popup_menu")}>
        {itemElements}
    </div>;
};

