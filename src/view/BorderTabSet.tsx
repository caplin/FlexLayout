import * as React from "react";
import { DockLocation } from "../model/DockLocation";
import { BorderNode } from "../model/BorderNode";
import { TabNode } from "../model/TabNode";
import { BorderButton } from "./BorderButton";
import { LayoutController } from "./layout/LayoutInternal";
import { ITabSetRenderValues } from "./layout/LayoutTypes";
import { showOverflowMenu } from "./PopupMenu";
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
    const [overflowMenuOpen, setOverflowMenuOpen] = React.useState(false);
    const hideOverflowRef = React.useRef<(() => void) | null>(null);

    const icons = controller.getIcons();

    // close an open overflow menu if this border unmounts (e.g. removed by an external doAction);
    // otherwise showPopup's document listener + overlay + portal would leak
    React.useEffect(() => () => hideOverflowRef.current?.(), []);

    const { userControlledPositionRef, onScroll, onScrollPointerDown, hiddenTabs, onMouseWheel, isDockStickyButtons, isShowHiddenTabs } = useTabOverflow(
        controller,
        borderNode,
        Orientation.flip(borderNode.getOrientation()),
        tabStripInnerRef,
        miniScrollRef,
        selfRef,
        controller.getClassName(CLASSES.FLEXLAYOUT__BORDER_BUTTON),
    );

    // register with the layout's central measure pass via a callback ref: it fires whenever
    // react attaches/detaches the element, including remounts the component cannot know about
    // (e.g. moving into the maximize portal), unlike an effect
    const setSelfRef = React.useCallback(
        (element: HTMLDivElement | null) => {
            selfRef.current = element;
            controller.registerMeasurable(borderNode, "borderheader", element);
        },
        [controller, borderNode],
    );

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
        const items = hiddenTabs.map((h) => {
            return { index: h, node: borderNode.getChildren()[h] as TabNode };
        });
        if (callback !== undefined) {
            callback(borderNode, event, items, onOverflowItemSelect);
        } else {
            const element = overflowbuttonRef.current!;
            setOverflowMenuOpen(true);
            hideOverflowRef.current = showOverflowMenu(element, borderNode, items, onOverflowItemSelect, controller, () => {
                setOverflowMenuOpen(false);
                hideOverflowRef.current = null;
            });
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
                />,
            );
            if (i < borderNode.getChildren().length - 1) {
                tabButtons.push(<div key={"divider" + i} className={cm(CLASSES.FLEXLAYOUT__BORDER_TAB_DIVIDER)}></div>);
            }
        }
        return tabButtons;
    };

    const renderButtons = () => {
        // allow customization of tabset
        let leading: React.ReactNode = undefined;
        let buttons: React.ReactNode[] = [];
        let stickyButtons: React.ReactNode[] = [];
        let stickyBar: React.ReactNode = undefined;
        const renderState: ITabSetRenderValues = { leading, buttons, stickyButtons: stickyButtons, overflowPosition: undefined };
        controller.customizeTabSet(borderNode, renderState);
        leading = renderState.leading;
        stickyButtons = renderState.stickyButtons;
        buttons = renderState.buttons;

        if (renderState.overflowPosition === undefined) {
            renderState.overflowPosition = stickyButtons.length;
        }

        // the sticky buttons bar renders after the tablist element, not inside it: a tablist
        // may only contain tab children (the bar still sits directly after the last tab, in
        // the same scrolling row)
        if (stickyButtons.length > 0) {
            if (isDockStickyButtons) {
                buttons = [...stickyButtons, ...buttons];
            } else {
                stickyBar = (
                    <div
                        ref={stickyButtonsRef}
                        key="sticky_buttons_container"
                        onPointerDown={onInterceptPointerDown}
                        onDragStart={(e) => {
                            e.preventDefault();
                        }}
                        className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_STICKY_BUTTONS_CONTAINER)}
                    >
                        {stickyButtons}
                    </div>
                );
            }
        }

        if (isShowHiddenTabs) {
            const overflowTitle = controller.i18nName(I18nLabel.Overflow_Menu_Tooltip);
            let overflowContent;
            if (typeof icons.more === "function") {
                const items = hiddenTabs.map((h) => {
                    return { index: h, node: borderNode.getChildren()[h] as TabNode };
                });

                overflowContent = icons.more(borderNode, items);
            } else {
                overflowContent = (
                    <>
                        {icons.more}
                        <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_OVERFLOW_COUNT)}>{hiddenTabs.length > 0 ? hiddenTabs.length : ""}</div>
                    </>
                );
            }
            buttons.splice(
                Math.min(renderState.overflowPosition, buttons.length),
                0,
                // toolbar buttons carry an explicit tabindex: Safari only includes elements
                // with an explicit tabindex in the tab order (native buttons are skipped)
                <button
                    key="overflowbutton"
                    tabIndex={0}
                    aria-haspopup="menu"
                    aria-expanded={overflowMenuOpen}
                    aria-label={overflowTitle}
                    ref={overflowbuttonRef}
                    className={
                        cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON) +
                        " " +
                        cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_OVERFLOW) +
                        " " +
                        cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_OVERFLOW_ + borderNode.getLocation().getName())
                    }
                    title={overflowTitle}
                    onClick={onOverflowClick}
                    onPointerDown={onInterceptPointerDown}
                >
                    {overflowContent}
                </button>,
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
                            tabIndex={0}
                            title={popoutFloatTitle}
                            aria-label={popoutFloatTitle}
                            className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_FLOAT)}
                            onClick={onPopoutFloat}
                            onPointerDown={onInterceptPointerDown}
                        >
                            {typeof icons.popoutFloat === "function" ? icons.popoutFloat(selectedTabNode) : icons.popoutFloat}
                        </button>,
                    );
                }

                if (controller.isSupportsPopout() && selectedTabNode.isEnablePopoutIcon() && selectedTabNode.isAllowedInWindow()) {
                    const popoutTitle = controller.i18nName(I18nLabel.Popout_Tab);
                    buttons.push(
                        <button
                            key="popout"
                            tabIndex={0}
                            title={popoutTitle}
                            aria-label={popoutTitle}
                            className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_FLOAT)}
                            onClick={onPopoutWindow}
                            onPointerDown={onInterceptPointerDown}
                        >
                            {typeof icons.popout === "function" ? icons.popout(selectedTabNode) : icons.popout}
                        </button>,
                    );
                }
            }
        }
        const toolbar = (
            <div key="toolbar" ref={toolbarRef} className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_ + borderNode.getLocation().getName())}>
                {buttons}
            </div>
        );

        return { leading, toolbar, stickyBar };
    };

    const tabButtons = renderTabs();
    const { leading, toolbar, stickyBar } = renderButtons();

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
        miniScrollbar = <div ref={miniScrollRef} aria-hidden="true" className={cm(CLASSES.FLEXLAYOUT__MINI_SCROLLBAR)} onPointerDown={onScrollPointerDown} />;
    }

    let leadingContainer: React.ReactNode = undefined;
    if (leading) {
        leadingContainer = <div className={cm(CLASSES.FLEXLAYOUT__BORDER_LEADING)}>{leading}</div>;
    }

    return (
        <div
            ref={setSelfRef}
            style={{
                display: "flex",
                flexDirection: borderNode.getOrientation() === Orientation.VERT ? "row" : "column",
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
                        // while one of this border's tabs shows its rename textbox, the strip is
                        // a plain container (see the matching comment in TabSet)
                        role={controller.getEditingTab()?.getParent() === borderNode ? undefined : "tablist"}
                        aria-orientation={
                            controller.getEditingTab()?.getParent() !== borderNode && (borderNode.getLocation() === DockLocation.LEFT || borderNode.getLocation() === DockLocation.RIGHT)
                                ? "vertical"
                                : undefined
                        }
                        className={cm(CLASSES.FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER_ + borderNode.getLocation().getName())}
                    >
                        {tabButtons}
                    </div>
                    {stickyBar}
                </div>
                {miniScrollbar}
            </div>
            {toolbar}
        </div>
    );
};

BorderTabSet.displayName = "BorderTabSet"; // name in react dev tools
