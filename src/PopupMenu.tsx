import * as React from "react";
import { DragDrop } from "./DragDrop";
import { TabNode } from "./model/TabNode";
import { CLASSES } from "./Types";
import { IconFactory, ILayoutCallbacks, TitleFactory } from "./view/Layout";
import { TabButtonStamp } from "./view/TabButtonStamp";

/** @internal */
export function showPopup(
    triggerElement: Element,
    items: { index: number; node: TabNode }[],
    onSelect: (item: { index: number; node: TabNode }) => void,
    layout: ILayoutCallbacks,
    iconFactory?: IconFactory,
    titleFactory?: TitleFactory,
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
    DragDrop.instance.addGlass(() => onHide());
    DragDrop.instance.setGlassCursorOverride("default");

    if (layoutDiv) {
        layoutDiv.appendChild(elm);
    }

    const onHide = () => {
        layout.hidePortal();
        DragDrop.instance.hideGlass();
        if (layoutDiv) {
            layoutDiv.removeChild(elm);
        }
        elm.removeEventListener("mousedown", onElementMouseDown);
        currentDocument.removeEventListener("mousedown", onDocMouseDown);
    };

    const onElementMouseDown = (event: Event) => {
        event.stopPropagation();
    };

    const onDocMouseDown = (_event: Event) => {
        onHide();
    };

    elm.addEventListener("mousedown", onElementMouseDown);
    currentDocument.addEventListener("mousedown", onDocMouseDown);

    layout.showPortal(<PopupMenu
        currentDocument={currentDocument}
        onSelect={onSelect}
        onHide={onHide}
        items={items}
        classNameMapper={classNameMapper}
        layout={layout}
        iconFactory={iconFactory}
        titleFactory={titleFactory}
    />, elm);
}

/** @internal */
interface IPopupMenuProps {
    items: { index: number; node: TabNode }[];
    currentDocument: Document;
    onHide: () => void;
    onSelect: (item: { index: number; node: TabNode }) => void;
    classNameMapper: (defaultClassName: string) => string;
    layout: ILayoutCallbacks;
    iconFactory?: IconFactory;
    titleFactory?: TitleFactory;
}

/** @internal */
const PopupMenu = (props: IPopupMenuProps) => {
    const { items, onHide, onSelect, classNameMapper, layout, iconFactory, titleFactory} = props;

    const onItemClick = (item: { index: number; node: TabNode }, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        onSelect(item);
        onHide();
        event.stopPropagation();
    };

    const itemElements = items.map((item, i) => (
        <div key={item.index}
            className={classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU_ITEM)}
            data-layout-path={"/popup-menu/tb" + i}
            onClick={(event) => onItemClick(item, event)}
            title={item.node.getHelpText()} >
            {item.node.getModel().isLegacyOverflowMenu() ? 
            item.node._getNameForOverflowMenu() :
            <TabButtonStamp 
                node={item.node}
                layout={layout}
                iconFactory={iconFactory}
                titleFactory={titleFactory}
            />}
        </div>
    ));

    return (
        <div className={classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU)}
        data-layout-path="/popup-menu"
        >
            {itemElements}
        </div>);
};
