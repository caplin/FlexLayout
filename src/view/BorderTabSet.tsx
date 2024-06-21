import * as React from "react";
import { DockLocation } from "../DockLocation";
import { BorderNode } from "../model/BorderNode";
import { TabNode } from "../model/TabNode";
import { BorderButton } from "./BorderButton";
import { LayoutInternal, ITabSetRenderValues } from "./Layout";
import { showPopup } from "./PopupMenu";
import { Actions } from "../model/Actions";
import { I18nLabel } from "../I18nLabel";
import { useTabOverflow } from "./TabOverflowHook";
import { Orientation } from "../Orientation";
import { CLASSES } from "../Types";
import { isAuxMouseEvent } from "./Utils";
import { Rect } from "../Rect";

/** @internal */
export interface IBorderTabSetProps {
    border: BorderNode;
    layout: LayoutInternal;
    size: number;
}

/** @internal */
export const BorderTabSet = (props: IBorderTabSetProps) => {
    const { border, layout, size } = props;

    const toolbarRef = React.useRef<HTMLDivElement | null>(null);
    const overflowbuttonRef = React.useRef<HTMLButtonElement | null>(null);
    const stickyButtonsRef = React.useRef<HTMLDivElement | null>(null);

    const icons = layout.getIcons();

    React.useLayoutEffect(() => {
        border.setTabHeaderRect(Rect.getBoundingClientRect(selfRef.current!).relativeTo(layout.getDomRect()!));
    });
    
    const { selfRef, position, userControlledLeft, hiddenTabs, onMouseWheel, tabsTruncated }
        = useTabOverflow(border, Orientation.flip(border.getOrientation()), toolbarRef, stickyButtonsRef);

    const onAuxMouseClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (isAuxMouseEvent(event)) {
            layout.auxMouseClick(border, event);
        }
    };

    const onContextMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        layout.showContextMenu(border, event);
    };

    const onInterceptPointerDown = (event: React.PointerEvent) => {
        event.stopPropagation();
    };

    const onOverflowClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const callback = layout.getShowOverflowMenu();
        if (callback !== undefined) {
            callback(border, event, hiddenTabs, onOverflowItemSelect);
        } else {
            const element = overflowbuttonRef.current!;
            showPopup(element,
                hiddenTabs,
                onOverflowItemSelect,
                layout);
        }
        event.stopPropagation();
    };

    const onOverflowItemSelect = (item: { node: TabNode; index: number }) => {
        layout.doAction(Actions.selectTab(item.node.getId()));
        userControlledLeft.current = false;
    };

    const onPopoutTab = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const selectedTabNode = border.getChildren()[border.getSelected()] as TabNode;
        if (selectedTabNode !== undefined) {
            layout.doAction(Actions.popoutTab(selectedTabNode.getId()));
        }
        event.stopPropagation();
    };

    const cm = layout.getClassName;

    const tabButtons: any = [];

    const layoutTab = (i: number) => {
        let isSelected = border.getSelected() === i;
        let child = border.getChildren()[i] as TabNode;

        tabButtons.push(
            <BorderButton
                layout={layout}
                border={border.getLocation().getName()}
                node={child}
                path={border.getPath() + "/tb" + i}
                key={child.getId()}
                selected={isSelected}
                icons={icons}
            />
        );
        if (i < border.getChildren().length - 1) {
            tabButtons.push(
                <div key={"divider" + i} className={cm(CLASSES.FLEXLAYOUT__BORDER_TAB_DIVIDER)}></div>
            );
        }
    };

    for (let i = 0; i < border.getChildren().length; i++) {
        layoutTab(i);
    }

    let borderClasses = cm(CLASSES.FLEXLAYOUT__BORDER) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_ + border.getLocation().getName());
    if (border.getClassName() !== undefined) {
        borderClasses += " " + border.getClassName();
    }

    // allow customization of tabset right/bottom buttons
    let buttons: any[] = [];
    let stickyButtons: any[] = [];
    const renderState: ITabSetRenderValues = { buttons, stickyButtons: stickyButtons, overflowPosition: undefined };
    layout.customizeTabSet(border, renderState);
    buttons = renderState.buttons;

    if (renderState.overflowPosition === undefined) {
        renderState.overflowPosition = stickyButtons.length;
    }

    if (stickyButtons.length > 0) {
        if (tabsTruncated) {
            buttons = [...stickyButtons, ...buttons];
        } else {
            tabButtons.push(<div
                ref={stickyButtonsRef}
                key="sticky_buttons_container"
                onPointerDown={onInterceptPointerDown}
                onDragStart={(e) => { e.preventDefault() }}
                className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_STICKY_BUTTONS_CONTAINER)}
            >
                {stickyButtons}
            </div>);
        }
    }

    if (hiddenTabs.length > 0) {
        const overflowTitle = layout.i18nName(I18nLabel.Overflow_Menu_Tooltip);
        let overflowContent;
        if (typeof icons.more === "function") {
            overflowContent = icons.more(border, hiddenTabs);
        } else {
            overflowContent = (<>
                {icons.more}
                <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_OVERFLOW_COUNT)}>{hiddenTabs.length}</div>
            </>);
        }
        buttons.splice(Math.min(renderState.overflowPosition, buttons.length), 0,
            <button
                key="overflowbutton"
                ref={overflowbuttonRef}
                className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_OVERFLOW) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_OVERFLOW_ + border.getLocation().getName())}
                title={overflowTitle}
                onClick={onOverflowClick}
                onPointerDown={onInterceptPointerDown}
            >
                {overflowContent}
            </button>
        );
    }

    const selectedIndex = border.getSelected();
    if (selectedIndex !== -1) {
        const selectedTabNode = border.getChildren()[selectedIndex] as TabNode;
        if (selectedTabNode !== undefined && layout.isSupportsPopout() && selectedTabNode.isEnablePopout()) {
            const popoutTitle = layout.i18nName(I18nLabel.Popout_Tab);
            buttons.push(
                <button
                    key="popout"
                    title={popoutTitle}
                    className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_FLOAT)}
                    onClick={onPopoutTab}
                    onPointerDown={onInterceptPointerDown}
                >
                    {(typeof icons.popout === "function") ? icons.popout(selectedTabNode) : icons.popout}
                </button>
            );
        }
    }
    const toolbar = (
        <div key="toolbar" ref={toolbarRef} className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_ + border.getLocation().getName())}>
            {buttons}
        </div>
    );

    let innerStyle = {};
    let outerStyle = {};
    const borderHeight = size - 1;
    if (border.getLocation() === DockLocation.LEFT) {
        innerStyle = { right: "100%", top: position };
        outerStyle = { width: borderHeight };
    } else if (border.getLocation() === DockLocation.RIGHT) {
        innerStyle = { left: "100%" , top:position};
        outerStyle = { width: borderHeight };
    } else {
        innerStyle = { left:position};
        outerStyle = { height: borderHeight };
    }

    return (
        <div
            ref={selfRef}
            style={{
                display: "flex",
                flexDirection: (border.getOrientation() === Orientation.VERT ? "row" : "column")
            }}
            className={borderClasses}
            data-layout-path={border.getPath()}
            onClick={onAuxMouseClick}
            onAuxClick={onAuxMouseClick}
            onContextMenu={onContextMenu}
            onWheel={onMouseWheel}
        >
            <div
                style={outerStyle}
                className={cm(CLASSES.FLEXLAYOUT__BORDER_INNER) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_INNER_ + border.getLocation().getName())}
            >
                <div
                    style={innerStyle}
                    className={cm(CLASSES.FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER_ + border.getLocation().getName())}
                >
                    {tabButtons}
                </div>
            </div>
            {toolbar}
        </div>
    );

};
