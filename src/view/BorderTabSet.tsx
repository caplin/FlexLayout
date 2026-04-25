import * as React from "react";
import { DockLocation } from "../model/DockLocation";
import { BorderNode } from "../model/BorderNode";
import { TabNode } from "../model/TabNode";
import { BorderButton } from "./BorderButton";
import { LayoutController } from "./layout/LayoutInternal";
import { ITabSetRenderValues } from "./layout/LayoutTypes";
import { showPopup } from "./PopupMenu";
import { Actions } from "../model/Actions";
import { I18nLabel } from "./I18nLabel";
import { useTabOverflow } from "./TabOverflowHook";
import { Orientation } from "../model/Orientation";
import { CLASSES } from "./CSSClassNames";
import { isAuxMouseEvent } from "./Utils";

/** @internal */
export interface IBorderTabSetProps {
    borderNode: BorderNode;
    controller: LayoutController;
    size: number;
}

/** @internal */
export const BorderTabSet = (props: IBorderTabSetProps) => {
    const { borderNode, controller, size } = props;

    // Must define `selfRef` before it is used in `useLayoutEffect`
    const selfRef = React.useRef<HTMLDivElement>(null);
    const toolbarRef = React.useRef<HTMLDivElement>(null);
    const miniScrollRef = React.useRef<HTMLDivElement>(null);
    const overflowbuttonRef = React.useRef<HTMLButtonElement>(null);
    const stickyButtonsRef = React.useRef<HTMLDivElement>(null);
    const tabStripInnerRef = React.useRef<HTMLDivElement>(null);

    const icons = controller.getIcons();

    const { userControlledPositionRef, onScroll, onScrollPointerDown, hiddenTabs, onMouseWheel, isDockStickyButtons, isShowHiddenTabs } =
        useTabOverflow(controller, borderNode, Orientation.flip(borderNode.getOrientation()), tabStripInnerRef, miniScrollRef,
            controller.getClassName(CLASSES.FLEXLAYOUT__BORDER_BUTTON)
        );

    React.useLayoutEffect(() => {
        if (selfRef.current) {
            borderNode.setTabHeaderRect(controller.getBoundingClientRect(selfRef.current));
        }
    });


    const onAuxMouseClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (isAuxMouseEvent(event)) {
            controller.auxMouseClick(borderNode, event);
        }
    };

    const onContextMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        controller.showContextMenu(borderNode, event);
    };

    const onInterceptPointerDown = (event: React.PointerEvent) => {
        event.stopPropagation();
    };

    const onOverflowClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const callback = controller.getShowOverflowMenu();
        const items = hiddenTabs.map(h => { return { index: h, node: (borderNode.getChildren()[h] as TabNode) }; });
        if (callback !== undefined) {

            callback(borderNode, event, items, onOverflowItemSelect);
        } else {
            const element = overflowbuttonRef.current!;
            showPopup(
                element,
                borderNode,
                items,
                onOverflowItemSelect,
                controller);
        }
        event.stopPropagation();
    };

    const onOverflowItemSelect = (item: { node: TabNode; index: number }) => {
        controller.doAction(Actions.selectTab(item.node.getId()));
        userControlledPositionRef.current = false;
    };

    const onPopoutWindow = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const selectedTabNode = borderNode.getChildren()[borderNode.getSelected()] as TabNode;
        if (selectedTabNode !== undefined) {
            controller.doAction(Actions.popoutTab(selectedTabNode.getId(), "window"));
        }
        event.stopPropagation();
    };

    const onPopoutFloat = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const selectedTabNode = borderNode.getChildren()[borderNode.getSelected()] as TabNode;
        if (selectedTabNode !== undefined) {
            controller.doAction(Actions.popoutTab(selectedTabNode.getId(), "float"));
        }
        event.stopPropagation();
    };

    const cm = controller.getClassName;

    const renderTabs = () => {
        const tabButtons: React.ReactNode[] = [];
        for (let i = 0; i < borderNode.getChildren().length; i++) {
            const isSelected = borderNode.getSelected() === i;
            const child = borderNode.getChildren()[i] as TabNode;

            tabButtons.push(
                <BorderButton
                    controller={controller}
                    border={borderNode.getLocation().getName()}
                    tabNode={child}
                    path={borderNode.getPath() + "/tb" + i}
                    key={child.getId()}
                    selected={isSelected}
                    icons={icons}
                />
            );
            if (i < borderNode.getChildren().length - 1) {
                tabButtons.push(
                    <div key={"divider" + i} className={cm(CLASSES.FLEXLAYOUT__BORDER_TAB_DIVIDER)}></div>
                );
            }
        }
        return tabButtons;
    };

    const renderButtons = (tabButtons: React.ReactNode[]) => {
        // allow customization of tabset
        let leading: React.ReactNode = undefined;
        let buttons: React.ReactNode[] = [];
        let stickyButtons: React.ReactNode[] = [];
        const renderState: ITabSetRenderValues = { leading, buttons, stickyButtons: stickyButtons, overflowPosition: undefined };
        controller.customizeTabSet(borderNode, renderState);
        leading = renderState.leading;
        stickyButtons = renderState.stickyButtons;
        buttons = renderState.buttons;

        if (renderState.overflowPosition === undefined) {
            renderState.overflowPosition = stickyButtons.length;
        }

        if (stickyButtons.length > 0) {
            if (isDockStickyButtons) {
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

        if (isShowHiddenTabs) {
            const overflowTitle = controller.i18nName(I18nLabel.Overflow_Menu_Tooltip);
            let overflowContent;
            if (typeof icons.more === "function") {
                const items = hiddenTabs.map(h => { return { index: h, node: (borderNode.getChildren()[h] as TabNode) }; });

                overflowContent = icons.more(borderNode, items);
            } else {
                overflowContent = (<>
                    {icons.more}
                    <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_OVERFLOW_COUNT)}>{hiddenTabs.length > 0 ? hiddenTabs.length : ""}</div>
                </>);
            }
            buttons.splice(Math.min(renderState.overflowPosition, buttons.length), 0,
                <button
                    key="overflowbutton"
                    ref={overflowbuttonRef}
                    className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_OVERFLOW) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_OVERFLOW_ + borderNode.getLocation().getName())}
                    title={overflowTitle}
                    onClick={onOverflowClick}
                    onPointerDown={onInterceptPointerDown}
                >
                    {overflowContent}
                </button>
            );
        }

        const selectedIndex = borderNode.getSelected();
        if (selectedIndex !== -1) {
            const selectedTabNode = borderNode.getChildren()[selectedIndex] as TabNode;

            if (selectedTabNode !== undefined && controller.isMainLayout()) {

                if (selectedTabNode.isEnablePopoutFloatIcon()) {
                    const popoutFloatTitle = controller.i18nName(I18nLabel.Popout_Tab_Float);
                    buttons.push(
                        <button
                            key="popout-float"
                            title={popoutFloatTitle}
                            className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_FLOAT)}
                            onClick={onPopoutFloat}
                            onPointerDown={onInterceptPointerDown}
                        >
                            {(typeof icons.popoutFloat === "function") ? icons.popoutFloat(selectedTabNode) : icons.popoutFloat}
                        </button>
                    );
                }

                if (controller.isSupportsPopout() &&
                    selectedTabNode.isEnablePopoutIcon() && selectedTabNode.isAllowedInWindow()) {
                    const popoutTitle = controller.i18nName(I18nLabel.Popout_Tab);
                    buttons.push(
                        <button
                            key="popout"
                            title={popoutTitle}
                            className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_FLOAT)}
                            onClick={onPopoutWindow}
                            onPointerDown={onInterceptPointerDown}
                        >
                            {(typeof icons.popout === "function") ? icons.popout(selectedTabNode) : icons.popout}
                        </button>
                    );
                }
            }
        }
        const toolbar = (
            <div key="toolbar" ref={toolbarRef} className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_ + borderNode.getLocation().getName())}>
                {buttons}
            </div>
        );

        return { leading, toolbar };
    };

    const tabButtons = renderTabs();
    const { leading, toolbar } = renderButtons(tabButtons);

    let borderClasses = cm(CLASSES.FLEXLAYOUT__BORDER) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_ + borderNode.getLocation().getName());
    if (borderNode.getClassName() !== undefined) {
        borderClasses += " " + borderNode.getClassName();
    }

    let innerStyle: React.CSSProperties;
    let outerStyle: React.CSSProperties;
    const borderHeight = size - 1;
    if (borderNode.getLocation() === DockLocation.LEFT) {
        innerStyle = { right: "100%", top: 0 };
        outerStyle = { width: borderHeight, overflowY: "auto" };
    } else if (borderNode.getLocation() === DockLocation.RIGHT) {
        innerStyle = { left: "100%", top: 0 };
        outerStyle = { width: borderHeight, overflowY: "auto" };
    } else {
        innerStyle = { left: 0 };
        outerStyle = { height: borderHeight, overflowX: "auto" };
    }

    let miniScrollbar = undefined;
    if (borderNode.isEnableTabScrollbar()) {
        miniScrollbar = (
            <div ref={miniScrollRef}
                className={cm(CLASSES.FLEXLAYOUT__MINI_SCROLLBAR)}
                onPointerDown={onScrollPointerDown}
            />
        );
    }

    let leadingContainer: React.ReactNode = undefined;
    if (leading) {
        leadingContainer = (
            <div className={cm(CLASSES.FLEXLAYOUT__BORDER_LEADING)}>
                {leading}
            </div>
        );
    }

    return (
        <div
            ref={selfRef}
            style={{
                display: "flex",
                flexDirection: (borderNode.getOrientation() === Orientation.VERT ? "row" : "column")
            }}
            className={borderClasses}
            data-layout-path={borderNode.getPath()}
            onClick={onAuxMouseClick}
            onAuxClick={onAuxMouseClick}
            onContextMenu={onContextMenu}
            onWheel={onMouseWheel}
        >
            {leadingContainer}
            <div className={cm(CLASSES.FLEXLAYOUT__MINI_SCROLLBAR_CONTAINER)}>
                <div
                    ref={tabStripInnerRef}
                    className={cm(CLASSES.FLEXLAYOUT__BORDER_INNER) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_INNER_ + borderNode.getLocation().getName())}
                    style={outerStyle}
                    onScroll={onScroll}
                >
                    <div
                        style={innerStyle}
                        className={cm(CLASSES.FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER_ + borderNode.getLocation().getName())}
                    >
                        {tabButtons}
                    </div>
                </div>
                {miniScrollbar}
            </div>
            {toolbar}
        </div >
    );

};
