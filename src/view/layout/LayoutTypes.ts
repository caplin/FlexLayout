import * as React from "react";
import { BorderNode } from "../../model/BorderNode";
import { IJsonTabNode } from "../../model/IJsonModel";
import { Node } from "../../model/Node";
import { TabNode } from "../../model/TabNode";
import { TabSetNode } from "../../model/TabSetNode";

export type DragRectRenderCallback = (
    content: React.ReactNode | undefined,
    node?: Node,
    json?: IJsonTabNode
) => React.ReactNode | undefined;

export type NodeMouseEvent = (
    node: TabNode | TabSetNode | BorderNode,
    event: React.MouseEvent<HTMLElement, MouseEvent>
) => void;

export type ShowOverflowMenuCallback = (
    node: TabSetNode | BorderNode,
    mouseEvent: React.MouseEvent<HTMLElement, MouseEvent>,
    items: { index: number; node: TabNode }[],
    onSelect: (item: { index: number; node: TabNode }) => void,
) => void;

export type TabSetPlaceHolderCallback = (node: TabSetNode) => React.ReactNode;

export interface ITabSetRenderValues {
    /** a component to be placed before the tabs */
    leading: React.ReactNode;
    /** components that will be added after the tabs */
    stickyButtons: React.ReactNode[];
    /** components that will be added at the end of the tabset */
    buttons: React.ReactNode[];
    /** position to insert overflow button within [...stickyButtons, ...buttons]
     * if left undefined position will be after the sticky buttons (if any) 
     */
    overflowPosition: number | undefined;
}

export interface ITabRenderValues {
    /** the icon or other leading component */
    leading: React.ReactNode;
    /** the main tab text/component */
    content: React.ReactNode;
    /** a set of react components to add to the tab after the content */
    buttons: React.ReactNode[];
}

/** Keyboard bindings for the layout's command shortcuts, each given as a key spec such as
 * "F2", "Escape" or "Ctrl+Delete" (a KeyboardEvent.key name, optionally prefixed by
 * modifiers Ctrl, Shift, Alt, Meta joined with +).
 *
 * Bindings given in the Layout keyMap prop are merged over defaultKeyMap; passing an explicit
 * undefined for a binding disables that shortcut. The bindings are advertised to assistive
 * technology via aria-keyshortcuts on the affected elements, so the advertised shortcuts always
 * match the configured ones.
 *
 * Only command shortcuts are configurable; the structural keys defined by the WAI-ARIA widget
 * patterns (arrow keys within a tablist, Enter/Space activation, popup menu navigation) are
 * fixed, since assistive technology announces those from the widget roles themselves.
 *
 * Note: WCAG 2.1.4 requires single printable character shortcuts to be remappable or off by
 * default, so prefer function keys or modifier combinations.
 */
export interface IKeyMap {
    /** closes the focused tab button's tab (when the tab is closeable) */
    closeTab?: string;
    /** starts renaming the focused tab button's tab (when the tab is renameable, tabset tabs only) */
    renameTab?: string;
    /** toggles focus between the selected tab button and its content; off by default */
    focusTabToggle?: string;
    /** moves focus to the selected tab button of the next tabset in the layout (wrapping),
     * from anywhere within the layout including inside tab content; off by default */
    focusNextTabset?: string;
    /** moves focus to the selected tab button of the previous tabset in the layout (wrapping),
     * from anywhere within the layout including inside tab content; off by default */
    focusPreviousTabset?: string;
    /** closes an open overlay border panel when focus is inside it (or on its tab button) and
     * returns focus to the tab button. Escape-to-dismiss is an ARIA convention, so overriding
     * this is rarely a good idea, but it can be rebound or disabled like the other commands */
    closeOverlayBorder?: string;
}

/** the default keyboard bindings, exported so applications can display or re-register them */
export const defaultKeyMap: Readonly<IKeyMap> = {
    closeTab: "Ctrl+Delete",
    renameTab: "F2",
    focusTabToggle: undefined,
    focusNextTabset: undefined,
    focusPreviousTabset: undefined,
    closeOverlayBorder: "Escape",
};

export interface IIcons {
    close?: (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
    pin?: (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
    closeTabset?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    popout?: (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
    popoutFloat?: (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
    maximize?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    restore?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    more?: (React.ReactNode | ((tabSetNode: (TabSetNode | BorderNode), hiddenTabs: { node: TabNode; index: number }[]) => React.ReactNode));
    edgeArrow?: React.ReactNode;
    activeTabset?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    closeFloatPopout?: (React.ReactNode | (() => React.ReactNode));
}

