import * as React from "react";
import { I18nLabel } from "./I18nLabel";
import { Actions } from "../model/Actions";
import { TabNode } from "../model/TabNode";
import { TabSetNode } from "../model/TabSetNode";
import { LayoutController } from "./layout/LayoutInternal";
import { ICloseType } from "../model/ICloseType";
import { CLASSES } from "./CSSClassNames";
import { domId, focusFirstIn, getRenderStateEx, hasModifier, isAuxMouseEvent, matchesKey, toAriaKeyShortcuts } from "./Utils";

/** @internal */
export interface ITabButtonProps {
    controller: LayoutController;
    tabNode: TabNode;
    selected: boolean;
    path: string;
}

/** @internal */
export const TabButton = (props: ITabButtonProps) => {
    const { controller, tabNode, selected, path } = props;
    const selfRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLInputElement>(null);
    const icons = controller.getIcons();
    const keyMap = controller.getKeyMap();
    const editing = controller.getEditingTab() === tabNode;

    // register with the layout's central measure pass via a callback ref: it fires whenever
    // react attaches/detaches the element, including remounts the component cannot know about
    // (e.g. the parent tabset moving into the maximize portal), unlike an effect
    const setSelfRef = React.useCallback(
        (element: HTMLDivElement | null) => {
            selfRef.current = element;
            controller.registerMeasurable(tabNode, "tabbutton", element);
        },
        [controller, tabNode],
    );

    React.useLayoutEffect(() => {
        if (editing) {
            (contentRef.current! as HTMLInputElement).select();
        }
    }, [editing]);

    // while editing, end the edit on any pointer down outside the textbox
    React.useEffect(() => {
        if (editing) {
            const body = controller.getCurrentDocument()!.body;
            const onEndEdit = (event: Event) => {
                if (event.target !== contentRef.current) {
                    controller.setEditingTab(undefined);
                }
            };
            body.addEventListener("pointerdown", onEndEdit);
            return () => body.removeEventListener("pointerdown", onEndEdit);
        }
        return undefined;
    }, [editing, controller]);

    const onDragStart = (event: React.DragEvent<HTMLElement>) => {
        if (tabNode.isEnableDrag()) {
            event.stopPropagation(); // prevent starting a tabset drag as well
            controller.getDragDropManager().setDragNode(event.nativeEvent, tabNode as TabNode);
        } else {
            event.preventDefault();
        }
    };

    const onDragEnd = (_event: React.DragEvent<HTMLElement>) => {
        controller.getDragDropManager().onDragEnded();
    };

    const onAuxMouseClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (isAuxMouseEvent(event)) {
            controller.auxMouseClick(tabNode, event);
        }
    };

    const onContextMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        controller.showContextMenu(tabNode, event);
    };

    const onClick = () => {
        controller.doAction(Actions.selectTab(tabNode.getId()));
    };

    const focusAdjacentTab = (delta: number) => {
        const tablist = selfRef.current?.closest('[role="tablist"]');
        if (tablist) {
            const tabElements = Array.from(tablist.querySelectorAll('[role="tab"]')) as HTMLElement[];
            const next = tabElements[tabElements.indexOf(selfRef.current!) + delta];
            next?.focus();
        }
    };

    // move focus into the tab content: the first focusable element, or the panel itself
    const focusTabContent = () => {
        const doc = selfRef.current!.ownerDocument;
        const focusPanel = () => focusFirstIn(doc.getElementById(domId("flexlayout-tab-", tabNode.getId())));
        if (selected) {
            focusPanel();
        } else {
            onClick(); // select first, focus once the panel is shown
            requestAnimationFrame(focusPanel);
        }
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (editing) {
            return; // the rename textbox handles its own keys
        }
        if (matchesKey(event, keyMap.focusTabToggle)) {
            focusTabContent();
            event.preventDefault();
        } else if (event.key === "Enter" || event.key === " ") {
            if (selected) {
                focusTabContent(); // activating an already selected tab enters its content
            } else {
                onClick();
            }
            event.preventDefault();
        } else if ((event.key === "ArrowLeft" || event.key === "ArrowUp") && !hasModifier(event)) {
            focusAdjacentTab(-1);
            event.preventDefault();
        } else if ((event.key === "ArrowRight" || event.key === "ArrowDown") && !hasModifier(event)) {
            focusAdjacentTab(1);
            event.preventDefault();
        } else if (matchesKey(event, keyMap.closeTab) && tabNode.isCloseable()) {
            focusAdjacentTab(1); // move focus to a neighbour before this tab is removed
            controller.doAction(Actions.deleteTab(tabNode.getId()));
            event.preventDefault();
        } else if (matchesKey(event, keyMap.renameTab) && tabNode.isEnableRename()) {
            onRename();
            event.preventDefault();
        }
    };

    const onDoubleClick = (event: React.MouseEvent<HTMLElement>) => {
        if (tabNode.isEnableRename()) {
            onRename();
            event.stopPropagation();
        }
    };

    const onRename = () => {
        controller.setEditingTab(tabNode);
    };

    const isClosable = () => {
        const closeType = tabNode.getCloseType();
        if (selected || closeType === ICloseType.Always) {
            return true;
        }
        if (closeType === ICloseType.Visible) {
            // not selected but x should be visible due to hover
            if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                return true;
            }
        }
        return false;
    };

    const onClose = (event: React.MouseEvent<HTMLElement>) => {
        if (isClosable()) {
            controller.doAction(Actions.deleteTab(tabNode.getId()));
            event.stopPropagation();
        }
    };

    const onClosePointerDown = (event: React.PointerEvent<HTMLElement>) => {
        event.stopPropagation();
    };

    const onTextBoxPointerDown = (event: React.PointerEvent<HTMLInputElement>) => {
        event.stopPropagation();
    };

    const onTextBoxKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.code === "Escape") {
            // esc
            controller.setEditingTab(undefined);
            selfRef.current?.focus(); // return focus to the tab button
        } else if (event.code === "Enter" || event.code === "NumpadEnter") {
            // enter
            controller.setEditingTab(undefined);
            controller.doAction(Actions.renameTab(tabNode.getId(), (event.target as HTMLInputElement).value));
            selfRef.current?.focus(); // return focus to the tab button
        }
    };

    const cm = controller.getClassName;
    const parentNode = tabNode.getParent() as TabSetNode;

    const isStretch = parentNode.isEnableSingleTabStretch() && parentNode.getChildren().length === 1;
    const baseClassName = isStretch ? CLASSES.FLEXLAYOUT__TAB_BUTTON_STRETCH : CLASSES.FLEXLAYOUT__TAB_BUTTON;
    let classNames = cm(baseClassName);
    classNames += " " + cm(baseClassName + "_" + parentNode.getTabLocation());

    if (!isStretch) {
        if (selected) {
            classNames += " " + cm(baseClassName + "--selected");
        } else {
            classNames += " " + cm(baseClassName + "--unselected");
        }
    }

    if (tabNode.isPinned()) {
        classNames += " " + cm(baseClassName + "--pinned");
    }

    if (tabNode.getClassName() !== undefined) {
        classNames += " " + tabNode.getClassName();
    }

    const renderState = getRenderStateEx(controller, tabNode);

    // keep exactly one tab stop in the tablist even when the tabset has no selected tab
    const isTabbable = selected || (parentNode.getSelectedNode() === undefined && parentNode.getChildren()[0] === tabNode);

    // advertise the tab's keyboard operations to assistive technology; composed from the
    // resolved keymap so the advertised shortcuts always match the configured bindings
    const ariaKeyshortcuts =
        [
            toAriaKeyShortcuts(keyMap.focusTabToggle),
            tabNode.isCloseable() ? toAriaKeyShortcuts(keyMap.closeTab) : undefined,
            tabNode.isEnableRename() ? toAriaKeyShortcuts(keyMap.renameTab) : undefined,
        ]
            .filter(Boolean)
            .join(" ") || undefined;

    let content = renderState.content ? <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_CONTENT)}>{renderState.content}</div> : null;

    const leading = renderState.leading ? <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_LEADING)}>{renderState.leading}</div> : null;

    if (editing) {
        content = (
            <input
                ref={contentRef}
                className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_TEXTBOX)}
                data-layout-path={path + "/textbox"}
                type="text"
                aria-label={controller.i18nName(I18nLabel.Rename_Tab)}
                autoFocus={true}
                defaultValue={tabNode.getName()}
                onKeyDown={onTextBoxKeyPress}
                onPointerDown={onTextBoxPointerDown}
            />
        );
    }

    if (tabNode.isPinned()) {
        const pinnedTitle = controller.i18nName(I18nLabel.Pinned_Tab);
        renderState.buttons.push(
            // the pinned state is conveyed to assistive technology via the tab's aria-label
            <div key="pin" data-layout-path={path + "/button/pin"} title={pinnedTitle} aria-hidden="true" className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_PIN)}>
                {typeof icons.pin === "function" ? icons.pin(tabNode) : icons.pin}
            </div>,
        );
    }

    if (tabNode.isCloseable() && !isStretch) {
        const closeTitle = controller.i18nName(I18nLabel.Close_Tab);
        renderState.buttons.push(
            // hidden from assistive technology: it is a pointer affordance for the tab's
            // close shortcut (advertised via aria-keyshortcuts), not a tab stop (per the
            // APG tabs pattern, tab elements should not contain interactive children)
            <div
                key="close"
                data-layout-path={path + "/button/close"}
                title={closeTitle}
                aria-hidden="true"
                className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_TRAILING)}
                onPointerDown={onClosePointerDown}
                onClick={onClose}
            >
                {typeof icons.close === "function" ? icons.close(tabNode) : icons.close}
            </div>,
        );
    }

    return (
        <div
            ref={setSelfRef}
            id={domId("flexlayout-tabbutton-", tabNode.getId())}
            // while the rename textbox is showing, the element is a plain container for it, not
            // a tab (a tab role must not contain interactive children); it stays programmatically
            // focusable so the end of the edit can return focus to it
            role={editing ? undefined : "tab"}
            aria-selected={editing ? undefined : selected}
            aria-controls={editing ? undefined : domId("flexlayout-tab-", tabNode.getId())}
            // an explicit name: the subtree contains the close/pin adornments, which must not
            // leak into the tab's computed name; pinned state is conveyed here
            aria-label={editing ? undefined : tabNode.isPinned() ? renderState.name + " (" + controller.i18nName(I18nLabel.Pinned_Tab) + ")" : renderState.name}
            aria-keyshortcuts={editing ? undefined : ariaKeyshortcuts}
            tabIndex={editing ? -1 : isTabbable ? 0 : -1}
            onKeyDown={onKeyDown}
            data-layout-path={path}
            className={classNames}
            onClick={onClick}
            onAuxClick={onAuxMouseClick}
            onContextMenu={onContextMenu}
            title={tabNode.getHelpText()}
            draggable={true}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDoubleClick={onDoubleClick}
        >
            {leading}
            {content}
            {renderState.buttons}
        </div>
    );
};

TabButton.displayName = "TabButton"; // name in react dev tools
