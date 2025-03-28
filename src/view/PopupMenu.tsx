import * as React from "react";
import { TabNode } from "../model/TabNode";
import { CLASSES } from "../Types";
import { LayoutInternal } from "./Layout";
import { TabButtonStamp } from "./TabButtonStamp";
import { TabSetNode } from "../model/TabSetNode";
import { BorderNode } from "../model/BorderNode";
import { useEffect, useRef } from "react";

/** @internal */
export function showPopup(
    triggerElement: Element,
    parentNode: TabSetNode | BorderNode,
    items: { index: number; node: TabNode }[],
    onSelect: (item: { index: number; node: TabNode }) => void,
    layout: LayoutInternal,
) {
    const layoutDiv = layout.getRootDiv();
    const classNameMapper = layout.getClassName;
    const currentDocument = triggerElement.ownerDocument;
    const triggerRect = triggerElement.getBoundingClientRect();
    const layoutRect = layoutDiv?.getBoundingClientRect() ?? new DOMRect(0, 0, 100, 100);

    const elm = currentDocument.createElement("div");
    elm.className = classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU_CONTAINER);
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

    layout.showOverlay(true);

    if (layoutDiv) {
        layoutDiv.appendChild(elm);
    }

    const onHide = () => {
        layout.hideControlInPortal();
        layout.showOverlay(false);
        if (layoutDiv) {
            layoutDiv.removeChild(elm);
        }
        elm.removeEventListener("pointerdown", onElementPointerDown);
        currentDocument.removeEventListener("pointerdown", onDocPointerDown);
    };

    const onElementPointerDown = (event: Event) => {
        event.stopPropagation();
    };

    const onDocPointerDown = (_event: Event) => {
        onHide();
    };

    elm.addEventListener("pointerdown", onElementPointerDown);
    currentDocument.addEventListener("pointerdown", onDocPointerDown);

    layout.showControlInPortal(<PopupMenu
        currentDocument={currentDocument}
        parentNode={parentNode}
        onSelect={onSelect}
        onHide={onHide}
        items={items}
        classNameMapper={classNameMapper}
        layout={layout}
    />, elm);
}

/** @internal */
interface IPopupMenuProps {
    parentNode: TabSetNode | BorderNode;
    items: { index: number; node: TabNode }[];
    currentDocument: Document;
    onHide: () => void;
    onSelect: (item: { index: number; node: TabNode }) => void;
    classNameMapper: (defaultClassName: string) => string;
    layout: LayoutInternal;
}

/** @internal */
const PopupMenu = (props: IPopupMenuProps) => {
    const { parentNode, items, onHide, onSelect, classNameMapper, layout } = props;
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Set focus when the component mounts
        if (divRef.current) {
            divRef.current.focus();
        }
    }, []);

    const onItemClick = (item: { index: number; node: TabNode }, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        onSelect(item);
        onHide();
        event.stopPropagation();
    };

    const onDragStart = (event: React.DragEvent<HTMLElement>, node: TabNode) => {
        event.stopPropagation(); // prevent starting a tabset drag as well
        layout.setDragNode(event.nativeEvent, node as TabNode);
        setTimeout(() => {
            onHide();
        }, 0);

    };

    const onDragEnd = (event: React.DragEvent<HTMLElement>) => {
        layout.clearDragMain();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
            onHide();
        }
    };

    const itemElements = items.map((item, i) => {
        let classes = classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU_ITEM);
        if (parentNode.getSelected() === item.index) {
            classes += " " + classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU_ITEM__SELECTED);
        }
        return (
            <div key={item.index}
                className={classes}
                data-layout-path={"/popup-menu/tb" + i}
                onClick={(event) => onItemClick(item, event)}
                draggable={true}
                onDragStart={(e) => onDragStart(e, item.node)}
                onDragEnd={onDragEnd}
                title={item.node.getHelpText()} >
                <TabButtonStamp
                    node={item.node}
                    layout={layout}
                />
            </div>
        )
    }
    );

    return (
        <div className={classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU)}
            ref={divRef}
            tabIndex={0}  // Make div focusable
            onKeyDown={handleKeyDown}
            data-layout-path="/popup-menu"
        >
            {itemElements}
        </div>);
};
