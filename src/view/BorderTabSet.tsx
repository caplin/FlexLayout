import * as React from "react";
import DockLocation from "../DockLocation";
import Border from "../model/BorderNode";
import TabNode from "../model/TabNode";
import { BorderButton } from "./BorderButton";
import { IIcons, ILayoutCallbacks } from "./Layout";
import { showPopup } from "../PopupMenu";
import Actions from "../model/Actions";
import { I18nLabel } from "../I18nLabel";
import { useTabOverflow } from "./TabOverflowHook";
import Orientation from "../Orientation";
import { CLASSES } from "../Types";

/** @hidden @internal */
export interface IBorderTabSetProps {
    border: Border;
    layout: ILayoutCallbacks;
    iconFactory?: (node: TabNode) => React.ReactNode | undefined;
    titleFactory?: (node: TabNode) => React.ReactNode | undefined;
    icons?: IIcons;
}

/** @hidden @internal */
export const BorderTabSet = (props: IBorderTabSetProps) => {
    const { border, layout, iconFactory, titleFactory, icons } = props;

    const toolbarRef = React.useRef<HTMLDivElement | null>(null);
    const overflowbuttonRef = React.useRef<HTMLButtonElement | null>(null);
    const stickyButtonsRef = React.useRef<HTMLDivElement | null>(null);

    const { selfRef, position, userControlledLeft, hiddenTabs, onMouseWheel } = useTabOverflow(border, Orientation.flip(border.getOrientation()), toolbarRef, stickyButtonsRef);

    const onInterceptMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<HTMLButtonElement, MouseEvent> | React.TouchEvent<HTMLButtonElement>) => {
        event.stopPropagation();
    };

    const onOverflowClick = () => {
        const element = overflowbuttonRef.current!;
        showPopup(layout.getRootDiv(), element, hiddenTabs, onOverflowItemSelect, layout.getClassName);
    };

    const onOverflowItemSelect = (item: { node: TabNode; index: number }) => {
        layout.doAction(Actions.selectTab(item.node.getId()));
        userControlledLeft.current = false;
    };

    const onFloatTab = () => {
        const selectedTabNode = border.getChildren()[border.getSelected()] as TabNode;
        if (selectedTabNode !== undefined) {
            layout.doAction(Actions.floatTab(selectedTabNode.getId()));
        }
    };

    const cm = layout.getClassName;

    let style = border.getTabHeaderRect()!.styleWithPosition({});
    const tabs: any = [];

    const layoutTab = (i: number) => {
        let isSelected = border.getSelected() === i;
        let child = border.getChildren()[i] as TabNode;

        tabs.push(
            <BorderButton
                layout={layout}
                border={border.getLocation().getName()}
                node={child}
                key={child.getId()}
                selected={isSelected}
                iconFactory={iconFactory}
                titleFactory={titleFactory}
                icons={icons}
            />
        );
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
    const renderState = { headerContent: {}, buttons, stickyButtons: [], headerButtons: [] };
    layout.customizeTabSet(border, renderState);
    buttons = renderState.buttons;

    let toolbar;

    if (hiddenTabs.length > 0) {
        const overflowTitle = layout.i18nName(I18nLabel.Overflow_Menu_Tooltip);
        buttons.push(
            <button
                key="overflowbutton"
                ref={overflowbuttonRef}
                className={cm("flexlayout__border_toolbar_button_overflow") + " " + cm("flexlayout__border_toolbar_button_overflow_" + border.getLocation().getName())}
                title={overflowTitle}
                onClick={onOverflowClick}
                onMouseDown={onInterceptMouseDown}
                onTouchStart={onInterceptMouseDown}
            >
                {icons?.more}
                {hiddenTabs.length}
            </button>
        );
    }

    const selectedIndex = border.getSelected();
    if (selectedIndex !== -1) {
        const selectedTabNode = border.getChildren()[selectedIndex] as TabNode;
        if (selectedTabNode !== undefined && layout.isSupportsPopout() && selectedTabNode.isEnableFloat() && !selectedTabNode.isFloating()) {
            const floatTitle = layout.i18nName(I18nLabel.Float_Tab);
            buttons.push(
                <button
                    key="float"
                    title={floatTitle}
                    className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_FLOAT)}
                    onClick={onFloatTab}
                    onMouseDown={onInterceptMouseDown}
                    onTouchStart={onInterceptMouseDown}
                />
            );
        }
    }
    toolbar = (
        <div key="toolbar" ref={toolbarRef} className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_ + border.getLocation().getName())}>
            {buttons}
        </div>
    );

    style = layout.styleFont(style);

    let innerStyle = {};
    const borderHeight = border.getBorderBarSize() - 1;
    if (border.getLocation() === DockLocation.LEFT) {
        innerStyle = { right: borderHeight, height: borderHeight, top: position };
    } else if (border.getLocation() === DockLocation.RIGHT) {
        innerStyle = { left: borderHeight, height: borderHeight, top: position };
    } else {
        innerStyle = { height: borderHeight, left: position };
    }

    return (
        <div ref={selfRef} style={style} className={borderClasses} onWheel={onMouseWheel}>
            <div style={{ height: borderHeight }} className={cm(CLASSES.FLEXLAYOUT__BORDER_INNER) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_INNER_ + border.getLocation().getName())}>
                <div style={innerStyle} className={cm(CLASSES.FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER_ + border.getLocation().getName())}>
                    {tabs}
                </div>
            </div>
            {toolbar}
        </div>
    );
};
